"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./my-photo.module.css";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import convert from "heic-convert/browser";
import deletePhoto from "@/actions/event/deletePhoto";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";
import type { T_EventPhoto } from "@/gql/types";

// import uploadPhotos from "@/actions/event/uploadPhotos";
import getToken from "@/actions/auth/getToken";
import axios from "axios";

const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50MB

// Helper to get a unique key for a file (for progress tracking)
function getFileKey(file: File) {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

export default function MyPhoto({ photos }: { photos: T_EventPhoto[] }) {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();

  const eventId = params.eventId;

  // For new files to upload
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  // For preview URLs
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  // For HEIC preview loading
  const [heicLoading, setHeicLoading] = useState(false);
  // For error message
  const [error, setError] = useState<string | null>(null);

  // For modal preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<T_EventPhoto | null>(null);

  // For upload progress per file (0-100)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const totalBatchSize = pendingFiles.reduce((acc, file) => acc + file.size, 0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      let newSize = totalBatchSize;
      setHeicLoading(true);
      try {
        for (const file of acceptedFiles) {
          if (newSize + file.size > MAX_BATCH_SIZE) {
            setError("Total batch size cannot exceed 50MB.");
            setHeicLoading(false);
            return;
          }

          if (
            file.type === "image/heic" ||
            file.name.toLowerCase().endsWith(".heic") ||
            file.type === "image/heif" ||
            file.name.toLowerCase().endsWith(".heif")
          ) {
            // Convert HEIC to JPEG for preview
            try {
              const arrayBuffer = (await file.arrayBuffer()) as ArrayBuffer;
              const uint8Array =
                new (globalThis.Uint8Array as typeof Uint8Array)(arrayBuffer);
              const outputBuffer = await convert({
                buffer: uint8Array,
                format: "JPEG",
                quality: 0.9,
              });
              const blob = new Blob([outputBuffer], { type: "image/jpeg" });
              const url = URL.createObjectURL(blob);
              newPreviews.push(url);
              // Push the converted JPEG as a File
              const jpegFile = new File(
                [blob],
                file.name.replace(/\.heic$/i, ".jpg"),
                { type: "image/jpeg" }
              );
              newFiles.push(jpegFile);
              newSize += jpegFile.size;
            } catch (err) {
              console.error("HEIC conversion failed", err);
              newPreviews.push(""); // fallback to blank
              newFiles.push(file);
              newSize += file.size;
            }
          } else {
            newFiles.push(file);
            newSize += file.size;

            newPreviews.push(URL.createObjectURL(file));
          }
        }
        setError(null);
        setPendingFiles((prev) => [...prev, ...newFiles]);
        setPendingPreviews((prev) => [...prev, ...newPreviews]);
      } finally {
        setHeicLoading(false);
      }
    },
    [totalBatchSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    noClick: false,
    noKeyboard: false,
    maxSize: MAX_BATCH_SIZE,
  });

  const handleUpload = async () => {
    const { success, token } = await getToken();
    if (!success) {
      setError("No token found");
      return;
    }
    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        // Use a plain GraphQL mutation string
        const mutation = `
          mutation UploadPhoto($captchaToken: String!, $eventId: UUID!, $file: File!) {
            uploadPhoto(captchaToken: $captchaToken, eventId: $eventId, file: $file) {
              photoId
            }
          }
        `;
        formData.append(
          "operations",
          JSON.stringify({
            query: mutation,
            variables: {
              captchaToken: "dummy-captcha", // TODO: Replace with real captcha
              eventId,
              file: null,
            },
          })
        );
        formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
        formData.append("0", file);

        // Use axios directly for upload progress
        const fileKey = getFileKey(file);
        await axios.request({
          method: "POST",
          baseURL: process.env.NEXT_PUBLIC_GQL_ENDPOINT,
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          data: formData,
          onUploadProgress: (progressEvent) => {
            console.log(`SIGMA PROGRESSing`);
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              console.log(`SIGMA PROGRESS: ${percent}`);
              setUploadProgress((prev) => ({ ...prev, [fileKey]: percent }));
            }
          },
        });

        setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));
      }
      // Optionally clear pending files after upload
      setPendingFiles([]);
      setPendingPreviews([]);
      setUploadProgress({});
      setError(null);
      alert("Upload complete");
      router.refresh();
    } catch (error) {
      console.log(`SIGMA ERROR: ${JSON.stringify(error, null, 2)}`);
      setError("Failed to upload photos");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        {/* Left: Dropzone with previews */}
        <div className={styles.dropzone} {...getRootProps()}>
          <input {...getInputProps()} />
          <p className={styles.dropzoneText}>
            {isDragActive
              ? "Drop the files here ..."
              : "Drag & drop photos here, or click to select files"}
          </p>
          {heicLoading && (
            <div
              className={styles.dropzoneText}
              style={{ color: "#888", marginBottom: 8 }}
            >
              Converting HEIC files for preview...
            </div>
          )}
          {error && <div className={styles.errorMsg}>{error}</div>}
          {pendingPreviews.length > 0 && (
            <div className={styles.pendingPreviewGrid}>
              {pendingPreviews.map((src, idx) => {
                const file = pendingFiles[idx];
                const fileKey = file ? getFileKey(file) : undefined;
                const percent = fileKey ? uploadProgress[fileKey] : undefined;
                return (
                  <div
                    key={idx}
                    className={styles.pendingPreviewItem}
                    style={{ position: "relative" }}
                  >
                    <Image
                      src={src}
                      alt={`Pending Photo ${idx + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    {percent !== undefined && percent < 100 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.4)",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 18,
                          zIndex: 2,
                        }}
                      >
                        {percent}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {pendingPreviews.length > 0 && (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
            >
              Upload
            </button>
          )}
        </div>
        {/* Right: Uploaded photos grid */}
        <div className={styles.galleryContainer}>
          {photos.length === 0 ? (
            <div className={styles.galleryTitle}>
              <span className={styles.galleryTitleText}>
                No uploaded photos yet
              </span>
            </div>
          ) : (
            photos.map((photo, idx) => (
              <div
                key={photo.photoId}
                className={styles.galleryItem}
                onClick={() => {
                  setModalPhoto(photo);
                  setModalOpen(true);
                }}
              >
                <Image
                  src={photo.presignedUrl || ""}
                  alt={`Photo ${idx + 1}`}
                  fill
                  className={styles.galleryItemImage}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))
          )}
        </div>
        <ImagePreviewModal
          open={modalOpen && !!modalPhoto}
          onClose={() => setModalOpen(false)}
          imageSrc={modalPhoto?.presignedUrl || ""}
          imageAlt={modalPhoto?.key || ""}
          imageWidth={modalPhoto?.width}
          imageHeight={modalPhoto?.height}
          onDelete={async () => {
            await deletePhoto("captchaDemo", modalPhoto!.photoId);
            alert("Photo deleted");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
