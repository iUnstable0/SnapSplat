"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

// import { useDropzone } from "react-dropzone";
// import convert from "heic-convert/browser";
// import axios from "axios";

// import { Images, ImageUp, X } from "lucide-react";

// import { AnimatePresence, motion } from "motion/react";

// import getToken from "@/actions/auth/getToken";

// import Spinner from "@/components/spinner";
// import Toaster from "@/components/toaster";

import PhotoGrid from "../../_components/photo-grid";
import PhotoUpload from "../../_components/photo-upload";

import type { T_Event, T_EventPhoto, T_EventMembership } from "@/gql/types";

// import styles from "./my-photo.module.css";

// import { toast } from "react-hot-toast";

type T_EventData = T_Event & {
  photos: T_EventPhoto[] & {
    member: T_EventMembership;
  };
};

const MAX_BATCH_SIZE = 50 * 1024 * 1024;

export default function MyPhoto({ event }: { event: T_EventData }) {
  // const router = useRouter();

  const [selectedPhoto, setSelectedPhoto] = useState<T_EventPhoto | null>(null);

  // const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  // const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  // const [heicLoading, setHeicLoading] = useState(false);
  // const [loading, setLoading] = useState<string | null>(null);

  // const [error, setError] = useState<string | null>(null);

  // const totalBatchSize = pendingFiles.reduce((acc, file) => acc + file.size, 0);

  // Drop handler (copy from bak, but no HEIC conversion for now)
  // const onDrop = useCallback(
  //   async (acceptedFiles: File[]) => {
  //     setHeicLoading(false);
  //     setLoading("Loading preview...");

  //     const newFiles: File[] = [];
  //     const newPreviews: string[] = [];

  //     let newSize = totalBatchSize;

  //     try {
  //       for (const file of acceptedFiles) {
  //         if (newSize + file.size > MAX_BATCH_SIZE) {
  //           // setError("Total batch size cannot exceed 50MB.");
  //           toast.error("Total batch size cannot exceed 50MB.");

  //           setLoading(null);

  //           return;
  //         }

  //         if (
  //           file.type === "image/heic" ||
  //           file.name.toLowerCase().endsWith(".heic") ||
  //           file.type === "image/heif" ||
  //           file.name.toLowerCase().endsWith(".heif")
  //         ) {
  //           setHeicLoading(true);

  //           try {
  //             const arrayBuffer = (await file.arrayBuffer()) as ArrayBuffer;

  //             const outputBuffer = await convert({
  //               // @ts-expect-error weird types
  //               buffer: new Uint8Array(arrayBuffer),
  //               format: "JPEG",
  //               quality: 0.9,
  //             });

  //             const blob = new Blob([outputBuffer], { type: "image/jpeg" });
  //             const url = URL.createObjectURL(blob);

  //             newPreviews.push(url);
  //           } catch (error) {
  //             console.error(error);

  //             setError(
  //               "Failed to convert HEIC files because your browser is not supported, please try a different browser or upload photos in another format."
  //             );

  //             setLoading(null);
  //             setHeicLoading(false);

  //             return;
  //           }
  //         } else {
  //           newPreviews.push(URL.createObjectURL(file));
  //         }

  //         newFiles.push(file);
  //         newSize += file.size;
  //       }

  //       setError(null);
  //       setLoading(null);
  //       setHeicLoading(false);

  //       setPendingFiles((prev) => [...prev, ...newFiles]);
  //       setPendingPreviews((prev) => [...prev, ...newPreviews]);
  //     } finally {
  //       setHeicLoading(false);
  //     }
  //   },
  //   [totalBatchSize]
  // );

  // const {
  //   getRootProps,
  //   getInputProps,
  //   isDragActive,
  //   isDragAccept,
  //   isDragReject,
  // } = useDropzone({
  //   onDrop,
  //   accept: { "image/*": [] },
  //   multiple: true,
  //   noClick: true,
  //   noKeyboard: true,
  //   maxSize: MAX_BATCH_SIZE,
  // });

  // Overlay upload handler
  // const handleUpload = async () => {
  //   const { success, token } = await getToken();

  //   if (!success) {
  //     setError("No token found");

  //     return;
  //   }

  //   const formData = new FormData();

  //   formData.append("eventId", event.eventId);
  //   formData.append("captchaToken", "dummy-captcha");

  //   for (const file of pendingFiles) {
  //     formData.append("files", file);
  //   }

  //   setLoading("Uploading photos...");

  //   try {
  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_REST_ENDPOINT}/event/upload-photo`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error(error);

  //     setError("Failed to upload photos");

  //     return;
  //   }

  //   setLoading(null);

  //   setPendingFiles([]);
  //   setPendingPreviews([]);

  //   router.refresh();
  // };

  return (
    <PhotoUpload
      event={event}
      selectedPhoto={selectedPhoto}
      setSelectedPhoto={setSelectedPhoto}
    >
      <PhotoGrid
        event={event}
        type="my"
        onPhotoClick={(photo) => {
          setSelectedPhoto(photo);
        }}
      />
    </PhotoUpload>

    // <div {...getRootProps()} className={styles.dropzone}>
    //   <Toaster />

    //   <AnimatePresence>
    //     {selectedPhoto && (
    //       <PhotoPreview
    //         photo={selectedPhoto}
    //         setSelectedPhoto={setSelectedPhoto}
    //         ownsPhoto={true}
    //       />
    //     )}
    //   </AnimatePresence>

    //   <PhotoGrid
    //     event={event}
    //     type="my"
    //     onPhotoClick={(photo) => {
    //       setSelectedPhoto(photo);
    //     }}
    //   />
    // </div>
  );
}
