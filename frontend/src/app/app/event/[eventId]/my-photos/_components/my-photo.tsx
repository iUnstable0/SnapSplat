"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./my-photo.module.css";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";
import type { T_EventPhoto } from "@/gql/types";

// import uploadPhotos from "@/actions/event/uploadPhotos";
import getToken from "@/actions/auth/getToken";

const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50MB

export default function MyPhoto({ photos }: { photos: T_EventPhoto[] }) {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();

  const eventId = params.eventId;

  // For new files to upload
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  // For preview URLs
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  // For error message
  const [error, setError] = useState<string | null>(null);

  // Placeholder for already uploaded photos (to be fetched later)
  const uploadedPhotos: string[] = [];

  const totalBatchSize = pendingFiles.reduce((acc, file) => acc + file.size, 0);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [] as File[];
      let newSize = totalBatchSize;
      for (const file of acceptedFiles) {
        if (newSize + file.size > MAX_BATCH_SIZE) {
          setError("Total batch size cannot exceed 50MB.");
          return;
        }
        newFiles.push(file);
        newSize += file.size;
      }
      setError(null);
      setPendingFiles((prev) => [...prev, ...newFiles]);
      setPendingPreviews((prev) => [
        ...prev,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);
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
        await requester.request(
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: formData,
            withAuth: true,
          },
          token
        );
      }
      // Optionally clear pending files after upload
      setPendingFiles([]);
      setPendingPreviews([]);
      setError(null);
      alert("Upload complete");
      router.refresh();
    } catch (error) {
      console.log(`SIGMA ERROR: ${JSON.stringify(error, null, 2)}`);
      setError("Failed to upload photos");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left: Dropzone with previews */}
      <div
        className={styles.dropzone}
        style={{ flex: 1, position: "relative" }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <p style={{ fontSize: 20, color: "#888" }}>
          {isDragActive
            ? "Drop the files here ..."
            : "Drag & drop photos here, or click to select files"}
        </p>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {pendingPreviews.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              width: "100%",
              marginTop: 16,
            }}
          >
            {pendingPreviews.map((src, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px #0001",
                }}
              >
                <Image
                  src={src}
                  alt={`Pending Photo ${idx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}
        {pendingPreviews.length > 0 && (
          <button
            type="button"
            style={{
              marginTop: 16,
              padding: "8px 24px",
              borderRadius: 6,
              background: "#222",
              color: "#fff",
              border: "none",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
          >
            Upload
          </button>
        )}
      </div>
      {/* Right: Uploaded photos grid (placeholder) */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          alignContent: "flex-start",
          padding: 24,
        }}
      >
        {photos.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "#aaa",
              fontSize: 24,
            }}
          >
            No uploaded photos yet
          </div>
        ) : (
          photos.map((photo, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 2px 8px #0001",
              }}
            >
              <Image
                src={photo.presignedUrl || ""}
                alt={`Photo ${idx + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
