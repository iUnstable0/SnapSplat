"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { useDropzone } from "react-dropzone";

import toast from "react-hot-toast";
// import convert from "heic-convert/browser";
import axios from "axios";
import clsx from "clsx";

import { Images, ImageUp, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { processFile } from "@/lib/utils";

import getToken from "@/actions/auth/getToken";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import { useBlurContext } from "@/components/blur-context";

import { Skeleton } from "@/components/ui/scn_skeleton";
import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";
import { TextShimmer } from "@/components/ui/mp_text-shimmer";
// import { TextMorph } from "@/components/ui/mp_text-morph";
// import { TextShimmerWave } from "@/components/ui/mp_text-shimmer-wave";
import { SlidingNumber } from "@/components/ui/mp_sliding-number";

import Spinner from "@/components/spinner";
import Toaster from "@/components/toaster";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { useUploadQueue, type T_FileQueue } from "../_hooks/useUploadQueue";

import UploadPreview from "./upload-preivew";

import type { T_Event, T_EventMembership, T_EventPhoto } from "@/gql/types";

import styles from "./photo-upload.module.css";

type T_EventData = T_Event;

const MAX_BATCH_BYTES = 100 * 1024 * 1024;

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

export default function PhotoUpload({
  event,
  children,
  disabled,
}: {
  event: T_EventData;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isBlurred, setIsBlurred } = useBlurContext();

  const { items, addFiles, removeItem, clearAll, canUpload, totalBytes } =
    useUploadQueue();

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [firstDrop, setFirstDrop] = useState<boolean>(true);

  const [fileLoadStatus, setFileLoadStatus] = useState<Record<string, boolean>>(
    {}
  );

  const [selectedPhoto, setSelectedPhoto] = useState<T_FileQueue | null>(null);

  const [uploadingProgress, setUploadingProgress] = useState<number>(0);

  const isDark = useMediaQuery("(prefers-color-scheme: dark)");

  const resetState = useCallback(
    (clearBlobs = true) => {
      // alert("resetState");

      if (clearBlobs) {
        clearAll();
        setFileLoadStatus({});
        setFirstDrop(true);
      }

      setUploadingProgress(0);
      setIsUploading(false);
    },
    [
      clearAll,
      setFirstDrop,
      setFileLoadStatus,
      setUploadingProgress,
      setIsUploading,
    ]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 1) {
        console.log("acceptedFiles.length > 1");
        setFirstDrop(false);
      }

      // setTimeout(() => {
      if (items.length > 1) {
        console.log("items.length > 0");
        setFirstDrop(false);
      }

      addFiles(acceptedFiles);
      // }, 1000);
    },
    [addFiles, items]
  );

  // const onDrop = useCallback(
  //   async (acceptedFiles: File[]) => {
  //     // if (disabled) {
  //     //   return;
  //     // }

  //     // setDropDisabled(true);

  //     setIsProcessing(true);

  //     // setLoading(
  //     //   acceptedFiles.length > 1
  //     //     ? `Processing ${acceptedFiles.length} files...`
  //     //     : `Processing ${acceptedFiles[0].name}...`
  //     // );

  //     const newProcessedFiles: T_FileQueue[] = [];
  //     let newSize = totalBatchSize;

  //     try {
  //       for (const file of acceptedFiles) {
  //         const fileHash = await hashFile(file);

  //         const fileExists = pendingFiles.find(
  //           (item) => item.hash === fileHash
  //         );

  //         if (fileExists) {
  //           // setPendingFiles((prev) =>
  //           //   prev.map((item, index) =>
  //           //     index === existingFileIndex
  //           //       ? { ...item, count: item.count + 1 }
  //           //       : item
  //           //   )
  //           // );

  //           // toast.error(`Duplicate file detected: ${file.name}`);

  //           toast.error(`File already selected: ${file.name}`, {
  //             id: `duplicate-file-${file.name}`,
  //           });

  //           continue;
  //         }

  //         if (newSize + file.size > MAX_BATCH_BYTES) {
  //           toast.error("Total batch size cannot exceed 50MB.", {
  //             id: "total-batch-size-exceeded",
  //           });

  //           // setLoading(null);
  //           // return;
  //           continue;
  //         }

  //         console.log(file);

  //         // let processedFile = file;
  //         // let previewUrl: string;

  //         // if (
  //         //   file.type === "image/heic" ||
  //         //   file.name.toLowerCase().endsWith(".heic") ||
  //         //   file.type === "image/heif" ||
  //         //   file.name.toLowerCase().endsWith(".heif")
  //         // ) {
  //         //   // setHeicLoading(true);

  //         //   try {
  //         //     const arrayBuffer = (await file.arrayBuffer()) as ArrayBuffer;

  //         //     const outputBuffer = await convert({
  //         //       // @ts-expect-error weird types
  //         //       buffer: new Uint8Array(arrayBuffer),
  //         //       format: "JPEG",
  //         //       quality: 0.9,
  //         //     });

  //         //     const blob = new Blob([outputBuffer], { type: "image/jpeg" });
  //         //     previewUrl = URL.createObjectURL(blob);

  //         //     processedFile = new File(
  //         //       [blob],
  //         //       file.name.replace(/\.(heic|heif)$/i, ".jpg"),
  //         //       {
  //         //         type: "image/jpeg",
  //         //         lastModified: file.lastModified,
  //         //       }
  //         //     );
  //         //   } catch (error) {
  //         //     console.error(error);

  //         //     setError(
  //         //       "Failed to convert HEIC files because your browser is not supported, please try a different browser or upload photos in another format."
  //         //     );

  //         //     setLoading(null);
  //         //     // setHeicLoading(false);

  //         //     return;
  //         //   }
  //         // } else {
  //         //   previewUrl = URL.createObjectURL(file);
  //         // }

  //         const { success, data } = await processFile(file);

  //         if (!success) {
  //           setError(
  //             "Failed to convert HEIC files because your browser is not supported, please try a different browser or upload photos in another format."
  //           );

  //           setLoading(null);

  //           setDropDisabled(false);

  //           return;
  //         }

  //         const { file: processedFile, preview: previewUrl } = data!;

  //         newPendingFiles.push({
  //           file: processedFile,
  //           hash: fileHash,
  //           count: 1,
  //           preview: previewUrl,
  //         });

  //         newSize += file.size;
  //       }

  //       if (pendingFiles.length > 0) {
  //         // alert(1);
  //         setFirstDrop(false);
  //       }

  //       setError(null);
  //       setLoading(null);
  //       // setHeicLoading(false);

  //       // setTimeout(() => {
  //       setPendingFiles((prev) => [...prev, ...newPendingFiles]);

  //       // }, 1000);

  //       setDropDisabled(false);

  //       // setPendingFiles((prev) => [...prev, ...newPendingFiles]);
  //     } finally {
  //       // setHeicLoading(false);
  //     }
  //   },
  //   [pendingFiles, totalBatchSize, disabled, dropDisabled]
  // );

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
    maxSize: MAX_BATCH_BYTES,
    disabled: disabled || isUploading,
  });

  const handleUpload = async () => {
    if (disabled || isUploading) return;

    if (!canUpload) {
      toast.error("Files are still processing.");

      return;
    }

    const ready = items.filter((it) => it.status === "ready");

    if (ready.length === 0) {
      toast.error("No files to upload.");

      return;
    }

    const { success, token } = await getToken();

    if (!success) {
      toast.error("Failed to get token");

      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append("eventId", event.eventId);
      formData.append("captchaToken", "dummy-captcha");

      for (const it of ready) {
        const f = it.fileOut ?? it.fileIn;
        formData.append("files", f);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_REST_ENDPOINT}/event/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (pe) => {
            if (pe.total) {
              setUploadingProgress(Math.round((pe.loaded * 100) / pe.total));
            } else {
              setUploadingProgress(99);
            }
          },
        }
      );

      resetState();

      router.push(
        `/app/event/${event.eventId}/my-photos?${searchParams.toString()}`
      );
    } catch (error) {
      console.error(error);

      toast.error("Failed to upload files");

      resetState(false);
    }
  };

  // const handleUpload = async () => {
  //   if (disabled) {
  //     return;
  //   }

  //   if (dropDisabled) {
  //     return;
  //   }

  //   const { success, token } = await getToken();

  //   if (!success) {
  //     toast.error("Failed to get token");

  //     return;
  //   }

  //   setDropDisabled(true);
  //   setUploading(true);

  //   setTimeout(async () => {
  //     const formData = new FormData();

  //     formData.append("eventId", event.eventId);
  //     formData.append("captchaToken", "dummy-captcha");

  //     for (const item of pendingFiles) {
  //       // formData.append("files", item.file, `${item.hash}-${item.count}`);
  //       formData.append("files", item.file);
  //     }

  //     // setLoading("Uploading photos...");

  //     try {
  //       await axios.post(
  //         `${process.env.NEXT_PUBLIC_REST_ENDPOINT}/event/upload-photo`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //             ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //           },
  //           onUploadProgress: (progressEvent) => {
  //             console.log(progressEvent);
  //             if (progressEvent.total) {
  //               const percentCompleted = Math.round(
  //                 (progressEvent.loaded * 100) / progressEvent.total
  //               );
  //               console.log(`Upload progress: ${percentCompleted}%`);
  //               setUploadingProgress(percentCompleted);
  //             } else {
  //               console.log(`Uploaded ${progressEvent.loaded} bytes`);
  //               setUploadingProgress(99);
  //             }
  //           },
  //         }
  //       );
  //     } catch (error) {
  //       console.error(error);

  //       // setError("Failed to upload photos");

  //       toast.error("Failed to upload files");

  //       setUploading(false);
  //       setUploadingProgress(0);
  //       setDropDisabled(false);

  //       return;
  //     }

  //     // setLoading(null);

  //     cleanupPreviews();
  //     setPendingFiles([]);

  //     setDropDisabled(false);
  //     setUploading(false);
  //     setUploadingProgress(0);

  //     // router.refresh();
  //     router.push(
  //       `/app/event/${event.eventId}/my-photos?${searchParams.toString()}`
  //     );
  //   }, 500);
  // };

  useEffect(() => {
    // if (disabled || isUploading) {
    //   return;
    // }

    if (isDragActive) {
      setIsBlurred(true);
    } else {
      setIsBlurred(false);
    }
  }, [isDragActive]);

  useEffect(() => {
    if (items.length === 1 && items[0].status === "processing") {
      setIsBlurred(true);
    } else {
      setIsBlurred(false);
    }

    // else if (items.length === 1) {
    //   setIsBlurred(false);
    // }
  }, [items]);

  // }, [isDragActive, isUploading]);

  // useEffect(() => {
  //   return () => {
  //     cleanupPreviews();
  //   };
  // }, [cleanupPreviews]);

  // useEffect(() => {
  //   if (loading) {
  //     setIsBlurred(true);
  //   } else {
  //     setIsBlurred(false);
  //   }
  // }, [loading]);

  return (
    <div {...getRootProps()} className={styles.dropzone}>
      <Toaster />
      {/* <div
        {...getRootProps()}
        className={styles.dropzone}
      >
        <input {...getInputProps()} />
      </div> */}

      <AnimatePresence>
        {selectedPhoto && (
          <UploadPreview
            photo={selectedPhoto}
            setSelectedPhoto={setSelectedPhoto}
            removeItem={removeItem}
          />
        )}
      </AnimatePresence>

      <input {...getInputProps()} />

      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            key="pending-previews"
            className={clsx(
              styles.dropModalOverlay,
              items.length > 1 && styles.dropModalOverlayGrid
            )}
            // initial={{ opacity: 0, transform: "scale(0.95)" }}
            // animate={{ opacity: 1, transform: "scale(1)" }}
            // exit={{ opacity: 0, transform: "scale(0.95)" }}
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
              {/* Blur overlay button menu */}
              {items.length > 1 && (
                <motion.div
                  className={styles.dropModalOverlayImagesGridOverlay}
                  // initial={{ opacity: 0, transform: "scale(0.95)" }}
                  // animate={{ opacity: 1, transform: "scale(1)" }}
                  // exit={{ opacity: 0, transform: "scale(0.95)" }}
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
                        onPress={resetState}
                        // forcetheme="dark"
                        dangerous={true}
                        disabled={isUploading || !!selectedPhoto}
                        // className={styles.toolbarButton}
                      >
                        Cancel
                      </KeybindButton>
                      <KeybindButton
                        keybinds={[T_Keybind.shift, T_Keybind.enter]}
                        onPress={() => {
                          handleUpload();
                        }}
                        // forcetheme="dark"
                        loading={isUploading}
                        loadingText={"Uploading..."}
                        disabled={isUploading || !canUpload || !!selectedPhoto}
                        // className={styles.toolbarButton}
                        preload={false}
                        loadingTextEnabled={false}
                      >
                        {isUploading ? (
                          <div className={styles.uploadingText}>
                            Uploading{" ("}
                            {/* <div className={styles.uploadingProgress}> */}
                            <SlidingNumber value={uploadingProgress} />
                            {/* </div> */}%{")"}
                          </div>
                        ) : (
                          "Upload"
                        )}
                      </KeybindButton>
                    </div>

                    <div className={styles.dropModalOverlayImagesTitle}>
                      <div className={styles.dropModalOverlayImagesTitleText}>
                        <SlidingNumber value={items.length} />
                        {" files selected"}
                      </div>
                      <div className={styles.dropModalOverlayImagesSize}>
                        <div
                          style={{
                            color: getFileSizeColor(
                              totalBytes,
                              MAX_BATCH_BYTES
                            ),
                          }}
                          className={styles.dropModalOverlayImagesSizeText}
                        >
                          <SlidingNumber
                            value={formatFileSizeNumber(totalBytes)}
                            decimalSeparator="."
                          />
                          {getFileSizeUnit(totalBytes)}
                        </div>
                        {" of "}
                        <span style={{ color: "#ef4444" }}>100 MB</span>
                        <div
                          className={styles.dropModalOverlayImagesSizeDragText}
                          style={{
                            opacity: isUploading ? 0 : 1,
                          }}
                        >
                          {" "}
                          <TextShimmer
                            // key={`text-shimmer-${pendingFiles.length}`}
                            duration={2.5}
                            spread={2}
                            className={`[--base-gradient-color:${isDark ? "#F3FEF1" : "#111827"}]`}
                          >
                            - Drag and drop additional files to upload here
                          </TextShimmer>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                className={clsx(
                  items.length === 1 && styles.dropModalOverlayContainer,
                  items.length > 1 && styles.dropModalOverlayImagesGrid
                )}
                key="imagescontainer"
                // initial={{ opacity: 0, transform: "scale(0.95)" }}
                // animate={{ opacity: 1, transform: "scale(1)" }}
                // exit={{ opacity: 0, transform: "scale(0.95)" }}
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
                // layout
              >
                <AnimatePresence mode="popLayout">
                  {items.length > 1 && items[0].previewUrl && (
                    <motion.div
                      key={`p-${items[0].hash}-initial`}
                      className={
                        styles.dropModalOverlayImageGridContainerInitial
                      }
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
                      {!fileLoadStatus[items[0].id] && (
                        <Skeleton
                          className={
                            styles.dropModalOverlayImageGridImageSkeleton
                          }
                        />
                      )}

                      <Image
                        src={items[0].previewUrl!}
                        alt={`Pending Photo`}
                        className={styles.dropModalOverlayImageGridImageInitial}
                        loading="lazy"
                        decoding="async"
                        width={100}
                        height={100}
                        onLoad={() => {
                          setFileLoadStatus((prev) => ({
                            ...prev,
                            [items[0].id]: true,
                          }));
                        }}
                      />
                    </motion.div>
                  )}

                  {/* photo grid */}
                  {items.length > 1 &&
                    items.map((it, idx) => (
                      <motion.button
                        key={`p-${it.hash}`}
                        className={clsx(
                          styles.dropModalOverlayImageGridContainer,
                          isUploading &&
                            styles.dropModalOverlayImageGridContainerDisabled,
                          !isUploading &&
                            styles.dropModalOverlayImageGridContainerEnabled
                        )}
                        initial={{ opacity: 0, scale: 0.9 }}
                        // initial={{ opacity: 0, transform: "scale(0.9)" }}
                        animate={{
                          opacity: isBlurred ? 0.7 : 1,
                          scale: 1,
                          // transform: "scale(1)",
                          ...(idx === 0 && firstDrop
                            ? {
                                transition: {
                                  delay: 0.3,
                                },
                              }
                            : {}),
                        }}
                        whileHover={{
                          scale: 1.02,
                          // transform: "scale(1.02)",
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                          // transform: "scale(0.9)",
                        }}
                        transition={{
                          opacity: {
                            duration: 0.2,
                            ease: "easeInOut",
                          },
                          type: "spring",
                          stiffness: 140,
                          damping: 20,
                        }}
                        disabled={isUploading}
                        onClick={(e) => {
                          if (isUploading) {
                            return;
                          }

                          setSelectedPhoto(it);
                        }}
                        layout
                      >
                        <AnimatePresence mode="popLayout">
                          {!it.previewUrl && (
                            <motion.div
                              key={`p-${it.id}-spinning`}
                              className={clsx(
                                styles.dropModalOverlayImageGridContainer,
                                styles.dropModalOverlayImageGridContainerSpinning
                              )}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                            >
                              <Spinner
                                id={it.id}
                                loading={true}
                                size={32}
                                // forcetheme="dark"
                              />
                            </motion.div>
                          )}

                          {it.previewUrl && (
                            <motion.div
                              key={`p-${it.id}-realimage`}
                              className={
                                styles.dropModalOverlayImageGridContainer
                              }
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                            >
                              <div
                                className={styles.dropModalOverlayImageDelete}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  if (isUploading) {
                                    return;
                                  }

                                  removeItem(it.id);
                                }}
                              >
                                <X
                                  className={
                                    styles.dropModalOverlayImageDeleteIcon
                                  }
                                />
                              </div>

                              <AnimatePresence>
                                {!fileLoadStatus[it.id] && (
                                  <motion.div
                                    key={`p-${it.id}-skeleton`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                      duration: 0.2,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    <Skeleton
                                      className={
                                        styles.dropModalOverlayImageGridImageSkeleton
                                      }
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <Image
                                src={it.previewUrl}
                                alt={`Pending Photo ${idx + 1}`}
                                className={
                                  styles.dropModalOverlayImageGridImage
                                }
                                style={{
                                  opacity: fileLoadStatus[it.id] ? 1 : 0,
                                }}
                                loading="lazy"
                                decoding="async"
                                fill
                                onLoad={() => {
                                  setFileLoadStatus((prev) => ({
                                    ...prev,
                                    [it.id]: true,
                                  }));
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}

                  {items.length === 1 &&
                    items.map((it) => {
                      if (!it.previewUrl) {
                        return null;
                      }

                      return (
                        <motion.div
                          key={`p-${it.hash}-initial`}
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
                              // delay: 0.3,
                            },
                          }}
                          layout
                        >
                          {!fileLoadStatus[it.id] && (
                            <Skeleton
                              className={styles.dropModalOverlayImagesSkeleton}
                            />
                          )}

                          <Image
                            src={it.previewUrl!}
                            className={styles.dropModalOverlayImagesImage}
                            // fill
                            width={100}
                            height={100}
                            alt={`Pending Photo`}
                            loading="lazy"
                            decoding="async"
                            onLoad={() => {
                              setFileLoadStatus((prev) => ({
                                ...prev,
                                [it.id]: true,
                              }));
                            }}
                          />

                          <ProgressiveBlur
                            className={styles.dropModalOverlayImagesBlur}
                            blurIntensity={2}
                          />

                          <div className={styles.dropModalOverlayImagesFooter}>
                            <KeybindButton
                              keybinds={[T_Keybind.escape]}
                              onPress={() => {
                                clearAll();
                              }}
                              forcetheme="dark"
                              dangerous={true}
                              disabled={isUploading}
                              className={styles.toolbarButton}
                            >
                              Cancel
                            </KeybindButton>
                            <KeybindButton
                              keybinds={[T_Keybind.shift, T_Keybind.enter]}
                              onPress={() => {
                                handleUpload();
                              }}
                              forcetheme="dark"
                              loading={isUploading}
                              loadingText={"Uploading..."}
                              disabled={isUploading || !canUpload}
                              className={styles.toolbarButton}
                              preload={false}
                              loadingTextEnabled={false}
                            >
                              {isUploading ? (
                                <div className={styles.uploadingText}>
                                  Uploading{" ("}
                                  {/* <div className={styles.uploadingProgress}> */}
                                  <SlidingNumber value={uploadingProgress} />
                                  {/* </div> */}%{")"}
                                </div>
                              ) : (
                                "Upload"
                              )}
                            </KeybindButton>
                          </div>
                          <div className={styles.dropModalOverlayImagesTitle}>
                            <div
                              className={clsx(
                                styles.dropModalOverlayImagesTitleText,
                                styles.dropModalOverlayImagesTitleTextDark
                              )}
                            >
                              {it.fileOut?.name ?? it.fileIn.name}
                            </div>
                            <div
                              className={clsx(
                                styles.dropModalOverlayImagesSize,
                                styles.dropModalOverlayImagesSizeTextDark
                              )}
                              style={
                                {
                                  // gradient based left to right filling up as file size increases
                                }
                              }
                            >
                              <span
                                style={{
                                  color: getFileSizeColor(
                                    totalBytes,
                                    MAX_BATCH_BYTES
                                  ),
                                }}
                                className={
                                  styles.dropModalOverlayImagesSizeText
                                }
                              >
                                {/* <SlidingNumber
              value={formatFileSizeNumber(item.file.size)}
              decimalSeparator="."
            /> */}
                                {/* {getFileSizeUnit(item.file.size)} */}
                                {/* <TextMorph> */}
                                {`${formatFileSizeNumber(totalBytes)} ${getFileSizeUnit(totalBytes)}`}
                                {/* </TextMorph> */}
                              </span>
                              {" of "}
                              <span style={{ color: "#ef4444" }}>100 MB</span>
                              <div
                                className={
                                  styles.dropModalOverlayImagesSizeDragText
                                }
                                style={{
                                  opacity: isUploading ? 0 : 1,
                                }}
                              >
                                {" "}
                                <TextShimmer
                                  // key={`text-shimmer-${item.file.name}`}
                                  duration={2.5}
                                  spread={2}
                                  // tailwind media dark:
                                  className=" [--base-gradient-color:#F3FEF1]"
                                >
                                  - Drag and drop additional files to upload
                                  here
                                </TextShimmer>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {isDragAccept && !isUploading && !disabled && !selectedPhoto && (
          <motion.div
            key="drag-accept"
            className={styles.dropModalOverlayCentered}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ImageUp className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>
              Drop files to upload
            </span>
          </motion.div>
        )}

        {isDragReject && !isUploading && !disabled && (
          <motion.div
            key="drag-reject"
            className={styles.dropModalOverlayCentered}
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

        {items.length === 1 && items[0].status === "processing" && (
          <motion.div
            key={`p-${items[0].id}-processing`}
            className={styles.dropModalOverlayCentered}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.galleryTitleIcon}>
              <Spinner id={`sp-${items[0].id}`} loading={true} size={32} />
            </div>
            <span className={styles.galleryTitleText}>Processing file...</span>
          </motion.div>
        )}

        {/* 
        {error && !disabled && (
          <motion.div
            key="error"
            className={styles.dropModalOverlayCentered}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>{error}</span>
          </motion.div>
        )} */}
      </AnimatePresence>

      {children}
    </div>
  );
}
