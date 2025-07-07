"use client";

import Image from "next/image";
import { useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import type { T_EventPhoto } from "@/gql/types";

import styles from "./gallery.module.css";

export default function Gallery({ photos }: { photos: T_EventPhoto[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<T_EventPhoto | null>(null);

  return (
    <>
      <div className={styles.galleryContainer}>
        {photos.map(
          (photo) =>
            photo.presignedUrl && (
              <div
                key={photo.photoId}
                className={styles.galleryItem}
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.presignedUrl}
                  alt={photo.photoId}
                  fill
                  className={styles.galleryItemImage}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )
        )}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className={styles.modalOverlay}
            onClick={() => setSelectedPhoto(null)}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
          >
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
              }}
              aria-label="Close"
            >
              ×
            </button>

            <Image
              src={selectedPhoto.presignedUrl ?? ""}
              alt={selectedPhoto.key ?? ""}
              width={selectedPhoto.width}
              height={selectedPhoto.height}
              className={styles.modalImage}
              style={{ objectFit: "contain" }}
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
