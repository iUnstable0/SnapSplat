"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import convert from "heic-convert/browser";
import axios from "axios";

import { Images, ImageUp, X } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import getToken from "@/actions/auth/getToken";

import Spinner from "@/components/spinner";
import Toaster from "@/components/toaster";
import { KeybindButton, T_Keybind } from "@/components/keybind";

import { useBlurContext } from "@/components/blur-context";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";
import { TextShimmer } from "@/components/ui/mp_text-shimmer";

import PhotoPreview from "./photo-preview";

import type { T_Event, T_EventMembership, T_EventPhoto } from "@/gql/types";

import styles from "./photo-upload.module.css";
import clsx from "clsx";
import { TextShimmerWave } from "@/components/ui/mp_text-shimmer-wave";
import { TextMorph } from "@/components/ui/mp_text-morph";
import { SlidingNumber } from "@/components/ui/mp_sliding-number";

type T_EventData = T_Event;

type T_PendingFile = {
  file: File;
  hash: string;
  count: number;
  preview: string;
};

const MAX_BATCH_SIZE = 50 * 1024 * 1024;

const formatFileSizeNumber = (bytes: number): number => {
  if (bytes === 0) return 0;
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2));
};

const getFileSizeUnit = (bytes: number): string => {
  if (bytes === 0) return "Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return sizes[i];
};

const lerpColor = (startColor: string, endColor: string, t: number): string => {
  const start = startColor.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [
    0, 255, 0,
  ];

  const end = endColor.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [
    255, 0, 0,
  ];

  t = Math.max(0, Math.min(1, t));

  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const getFileSizeColor = (currentSize: number, maxSize: number): string => {
  const percentage = currentSize / maxSize;
  return lerpColor("#22c55e", "#ef4444", percentage);
};

const hashFile = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (error) {
    console.error("Error hashing file:", error);
    // idk if i should do this or just tell the user to use a bette rbrowser lol
    return `${file.name}-${file.size}-${file.lastModified}`;
  }
};

export default function PhotoUpload({
  event,
  children,
}: {
  event: T_EventData;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isBlurred, setIsBlurred } = useBlurContext();

  //   const [selectedPhoto, setSelectedPhoto] = useState<T_EventPhoto | null>(null);

  const [pendingFiles, setPendingFiles] = useState<T_PendingFile[]>([]);
  // const [heicLoading, setHeicLoading] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [firstDrop, setFirstDrop] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const totalBatchSize = pendingFiles.reduce(
    (acc, item) => acc + item.file.size,
    // (acc, item) => acc + item.file.size * item.count,
    0
  );

  // const cleanupPreviews = useCallback(() => {
  //   alert("cleanup");
  //   pendingFiles.forEach((item) => {
  //     // URL.revokeObjectURL(item.preview);
  //   });
  // }, [pendingFiles]);

  const cleanupPreviews = () => {
    // alert("cleanup");
    pendingFiles.forEach((item) => {
      URL.revokeObjectURL(item.preview);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // setHeicLoading(false);
      setLoading(
        acceptedFiles.length > 1
          ? `Processing ${acceptedFiles.length} files...`
          : `Processing ${acceptedFiles[0].name}...`
      );

      const newPendingFiles: T_PendingFile[] = [];
      let newSize = totalBatchSize;

      try {
        for (const file of acceptedFiles) {
          const fileHash = await hashFile(file);

          const fileExists = pendingFiles.find(
            (item) => item.hash === fileHash
          );

          if (fileExists) {
            // setPendingFiles((prev) =>
            //   prev.map((item, index) =>
            //     index === existingFileIndex
            //       ? { ...item, count: item.count + 1 }
            //       : item
            //   )
            // );

            // toast.error(`Duplicate file detected: ${file.name}`);

            toast.error(`File already selected: ${file.name}`, {
              id: `duplicate-file-${file.name}`,
            });

            continue;
          }

          if (newSize + file.size > MAX_BATCH_SIZE) {
            toast.error("Total batch size cannot exceed 50MB.", {
              id: "total-batch-size-exceeded",
            });
            // setLoading(null);
            // return;
            continue;
          }

          console.log(file);

          let processedFile = file;
          let previewUrl: string;

          if (
            file.type === "image/heic" ||
            file.name.toLowerCase().endsWith(".heic") ||
            file.type === "image/heif" ||
            file.name.toLowerCase().endsWith(".heif")
          ) {
            // setHeicLoading(true);

            try {
              const arrayBuffer = (await file.arrayBuffer()) as ArrayBuffer;

              const outputBuffer = await convert({
                // @ts-expect-error weird types
                buffer: new Uint8Array(arrayBuffer),
                format: "JPEG",
                quality: 0.9,
              });

              const blob = new Blob([outputBuffer], { type: "image/jpeg" });
              previewUrl = URL.createObjectURL(blob);

              processedFile = new File(
                [blob],
                file.name.replace(/\.(heic|heif)$/i, ".jpg"),
                {
                  type: "image/jpeg",
                  lastModified: file.lastModified,
                }
              );
            } catch (error) {
              console.error(error);

              setError(
                "Failed to convert HEIC files because your browser is not supported, please try a different browser or upload photos in another format."
              );

              setLoading(null);
              // setHeicLoading(false);

              return;
            }
          } else {
            previewUrl = URL.createObjectURL(file);
          }

          newPendingFiles.push({
            file: processedFile,
            hash: fileHash,
            count: 1,
            preview: previewUrl,
          });

          newSize += file.size;
        }

        if (pendingFiles.length > 0) {
          // alert(1);
          setFirstDrop(false);
        }

        setError(null);
        setLoading(null);
        // setHeicLoading(false);

        // setTimeout(() => {
        setPendingFiles((prev) => [...prev, ...newPendingFiles]);
        // }, 1000);

        // setPendingFiles((prev) => [...prev, ...newPendingFiles]);
      } finally {
        // setHeicLoading(false);
      }
    },
    [pendingFiles, totalBatchSize]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_BATCH_SIZE,
  });

  const handleUpload = async () => {
    const { success, token } = await getToken();

    if (!success) {
      toast.error("Failed to get token");

      setUploading(false);

      return;
    }

    setUploading(true);

    const formData = new FormData();

    formData.append("eventId", event.eventId);
    formData.append("captchaToken", "dummy-captcha");

    for (const item of pendingFiles) {
      // formData.append("files", item.file, `${item.hash}-${item.count}`);
      formData.append("files", item.file);
    }

    // setLoading("Uploading photos...");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_REST_ENDPOINT}/event/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
    } catch (error) {
      console.error(error);

      // setError("Failed to upload photos");

      toast.error("Failed to upload files");

      setUploading(false);

      return;
    }

    // setLoading(null);

    cleanupPreviews();
    setPendingFiles([]);

    setUploading(false);

    // router.refresh();
    router.push(
      `/app/event/${event.eventId}/my-photos?${searchParams.toString()}`
    );
  };

  useEffect(() => {
    if (isDragActive || !!loading) {
      setIsBlurred(true);
    } else {
      setIsBlurred(false);
    }
  }, [isDragActive, loading]);

  // useEffect(() => {
  //   return () => {
  //     cleanupPreviews();
  //   };
  // }, [cleanupPreviews]);

  return (
    <div {...getRootProps()} className={styles.dropzone}>
      <Toaster />
      {/* <div
        {...getRootProps()}
        className={styles.dropzone}
      >
        <input {...getInputProps()} />
      </div> */}

      <input {...getInputProps()} />

      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <motion.div
            key="pending-previews"
            className={clsx(
              styles.dropModalOverlay,
              pendingFiles.length > 1 && styles.dropModalOverlayImagesGrid
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 140,
              damping: 20,
            }}
            layout
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {pendingFiles.length > 1 && (
                <motion.div
                  key={`p-${pendingFiles[0].hash}-initial`}
                  className={styles.dropModalOverlayImageGridContainerInitial}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 20,
                    opacity: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                  }}
                  layout
                >
                  <img
                    src={pendingFiles[0].preview}
                    alt={`Pending Photo`}
                    className={styles.dropModalOverlayImageGridImageInitial}
                    loading="eager"
                  />
                </motion.div>
              )}

              {pendingFiles.length > 1 && (
                <motion.div
                  className={styles.dropModalOverlayImagesGridOverlay}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    opacity: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                    type: "spring",
                    stiffness: 140,
                    damping: 20,
                  }}
                  layout
                >
                  <div className={styles.dropModalOverlayImagesGridOverlayCtn}>
                    <ProgressiveBlur
                      className={styles.dropModalOverlayImagesGridOverlayBlur}
                      blurIntensity={2}
                    />

                    <div className={styles.dropModalOverlayImagesFooter}>
                      <KeybindButton
                        keybinds={[T_Keybind.escape]}
                        onPress={() => {
                          cleanupPreviews();
                          setPendingFiles([]);
                        }}
                        forcetheme="dark"
                        dangerous={true}
                        disabled={uploading || !!loading}
                        className={styles.toolbarButton}
                      >
                        Cancel
                      </KeybindButton>
                      <KeybindButton
                        keybinds={[T_Keybind.shift, T_Keybind.enter]}
                        onPress={() => {
                          if (uploading) {
                            return;
                          }

                          handleUpload();
                        }}
                        forcetheme="dark"
                        loading={uploading}
                        loadingText="Uploading..."
                        disabled={uploading || !!loading}
                        className={styles.toolbarButton}
                        preload={false}
                      >
                        Upload
                      </KeybindButton>
                    </div>

                    <div className={styles.dropModalOverlayImagesTitle}>
                      <div className={styles.dropModalOverlayImagesTitleText}>
                        <SlidingNumber value={pendingFiles.length} />
                        {" files selected"}
                      </div>
                      <div className={styles.dropModalOverlayImagesSize}>
                        <span
                          style={{
                            color: getFileSizeColor(
                              totalBatchSize,
                              MAX_BATCH_SIZE
                            ),
                          }}
                          className={styles.dropModalOverlayImagesSizeText}
                        >
                          <SlidingNumber
                            value={formatFileSizeNumber(totalBatchSize)}
                            decimalSeparator="."
                          />
                          {getFileSizeUnit(totalBatchSize)}
                        </span>
                        {" of "}
                        <span style={{ color: "#ef4444" }}>50 MB</span>
                        <span
                          className={styles.dropModalOverlayImagesSizeDragText}
                        >
                          {" "}
                          <TextShimmer
                            duration={2.5}
                            spread={2}
                            className=" [--base-gradient-color:#F3FEF1]"
                          >
                            - Drag and drop additional files to upload here
                          </TextShimmer>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {pendingFiles.length > 1 &&
                pendingFiles.map((item, idx) => (
                  <motion.button
                    key={`p-${item.hash}`}
                    className={styles.dropModalOverlayImageGridContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      ...(idx === 0 && !firstDrop
                        ? {
                            transition: {
                              delay: 0.3,
                            },
                          }
                        : {}),
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      opacity: {
                        duration: 0.2,
                        ease: "easeInOut",
                      },
                      type: "spring",
                      stiffness: 140,
                      damping: 20,
                    }}
                    disabled={uploading || !!loading}
                    layout
                  >
                    <div
                      className={styles.dropModalOverlayImageDelete}
                      onClick={() => {
                        URL.revokeObjectURL(item.preview);

                        setPendingFiles((prev) =>
                          prev.filter((it) => it.hash !== item.hash)
                        );

                        console.log(pendingFiles);
                      }}
                    >
                      <X className={styles.dropModalOverlayImageDeleteIcon} />
                    </div>
                    <img
                      src={item.preview}
                      alt={`Pending Photo ${idx + 1}`}
                      className={styles.dropModalOverlayImageGridImage}
                      loading="eager"
                    />
                  </motion.button>
                ))}

              {pendingFiles.length === 1 &&
                pendingFiles.map((item) => (
                  <motion.div
                    key={`p-${item.hash}-initial`}
                    className={styles.dropModalOverlayImages}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isBlurred ? 0.7 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 20,
                      opacity: {
                        duration: 0.2,
                        ease: "easeInOut",
                      },
                    }}
                    layout
                  >
                    <img
                      src={item.preview}
                      className={styles.dropModalOverlayImagesImage}
                      alt={`Pending Photo`}
                      loading="eager"
                    />

                    <ProgressiveBlur
                      className={styles.dropModalOverlayImagesBlur}
                      blurIntensity={2}
                    />

                    <div className={styles.dropModalOverlayImagesFooter}>
                      <KeybindButton
                        keybinds={[T_Keybind.escape]}
                        onPress={() => {
                          cleanupPreviews();
                          setPendingFiles([]);
                        }}
                        forcetheme="dark"
                        dangerous={true}
                        disabled={uploading || !!loading}
                        className={styles.toolbarButton}
                      >
                        Cancel
                      </KeybindButton>
                      <KeybindButton
                        keybinds={[T_Keybind.shift, T_Keybind.enter]}
                        onPress={() => {
                          if (uploading) {
                            return;
                          }

                          handleUpload();
                        }}
                        forcetheme="dark"
                        loading={uploading}
                        loadingText="Uploading..."
                        disabled={uploading || !!loading}
                        className={styles.toolbarButton}
                        preload={false}
                      >
                        Upload
                      </KeybindButton>
                    </div>

                    <div className={styles.dropModalOverlayImagesTitle}>
                      <div className={styles.dropModalOverlayImagesTitleText}>
                        {item.file.name}
                      </div>
                      <div
                        className={styles.dropModalOverlayImagesSize}
                        style={
                          {
                            // gradient based left to right filling up as file size increases
                          }
                        }
                      >
                        <span
                          style={{
                            color: getFileSizeColor(
                              item.file.size,
                              MAX_BATCH_SIZE
                            ),
                          }}
                          className={styles.dropModalOverlayImagesSizeText}
                        >
                          {/* <SlidingNumber
                            value={formatFileSizeNumber(item.file.size)}
                            decimalSeparator="."
                          /> */}
                          {/* {getFileSizeUnit(item.file.size)} */}
                          {/* <TextMorph> */}
                          {`${formatFileSizeNumber(item.file.size)} ${getFileSizeUnit(item.file.size)}`}
                          {/* </TextMorph> */}
                        </span>
                        {" of "}
                        <span style={{ color: "#ef4444" }}>50 MB</span>
                        <span
                          className={styles.dropModalOverlayImagesSizeDragText}
                        >
                          {" "}
                          <TextShimmer
                            duration={2.5}
                            spread={2}
                            className=" [--base-gradient-color:#F3FEF1]"
                          >
                            - Drag and drop additional files to upload here
                          </TextShimmer>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}

        {isDragAccept && (
          <motion.div
            key="drag-accept"
            className={styles.dropModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ImageUp className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>
              Drop photos to upload
            </span>
          </motion.div>
        )}

        {isDragReject && (
          <motion.div
            key="drag-reject"
            className={styles.dropModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>
              You can only upload photos.
            </span>
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loadingheiclol"
            className={styles.dropModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.galleryTitleIcon}>
              <Spinner id="heicloading" loading={!!loading} size={24} />
            </div>
            <span
              className={styles.galleryTitleText}
              // style={{ marginLeft: "12px" }}
            >
              {loading}
            </span>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            className={styles.dropModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
