"use client";

import { useState, useEffect } from "react";

import Image from "next/image";

import { DateTime } from "luxon";

import { AnimatePresence, motion } from "motion/react";

import type { T_Event, T_EventPhoto, T_EventMembership } from "@/gql/types";

import styles from "./photo-grid.module.css";
import { Skeleton } from "@/components/ui/scn_skeleton";
import { TextMorph } from "@/components/ui/mp_text-morph";

import { useBlurContext } from "@/components/blur-context";
import clsx from "clsx";

type T_EventData = T_Event & {
  photos: T_EventPhoto[] & {
    member: T_EventMembership;
  };
};

export default function PhotoGrid({
  event,
  type,
  onPhotoClick,
}: {
  event: T_EventData;
  type: "my" | "all";
  onPhotoClick: (photo: T_EventPhoto) => void;
}) {
  const { isBlurred, setIsBlurred } = useBlurContext();

  const [selectedPhoto, setSelectedPhoto] = useState<T_EventPhoto | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [uploadedRelativeTime, setUploadedRelativeTime] = useState<
    string | null
  >(null);

  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // selectedPhoto must be hovered for at least 250ms before it can be shown
  useEffect(() => {
    if (selectedPhoto) {
      setUploadedRelativeTime(
        DateTime.fromISO(selectedPhoto.uploadedAt).toRelative()
      );

      const interval = setInterval(() => {
        setUploadedRelativeTime(
          DateTime.fromISO(selectedPhoto.uploadedAt).toRelative()
        );
      }, 500);

      // const timeout = setTimeout(() => {
      //   if (selectedPhoto) {
      //     setShowOverlay(true);
      //   } else {
      //     setShowOverlay(false);
      //   }
      // }, 250);

      // return () => clearTimeout(timeout);

      setShowOverlay(true);

      return () => clearInterval(interval);
    } else {
      setShowOverlay(false);
    }
  }, [selectedPhoto]);

  return (
    <div className={clsx(styles.photoGrid, isBlurred && styles.blurred)}>
      {event.photos
        .filter((photo) => photo.presignedUrl)
        .map((photo) => (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
            className={styles.photoGridItem}
            key={photo.photoId}
            onMouseEnter={() => setSelectedPhoto(photo)}
            onMouseLeave={() => setSelectedPhoto(null)}
            onClick={() => onPhotoClick(photo)}
          >
            <AnimatePresence>
              {!imageLoaded[photo.photoId] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Skeleton className={styles.photoGridItemImageSkeleton} />
                </motion.div>
              )}
            </AnimatePresence>

            <Image
              src={photo.presignedUrl!}
              alt={`Event ${photo.eventId}`}
              fill
              className={styles.photoGridItemImage}
              onLoad={() =>
                setImageLoaded((prev) => ({ ...prev, [photo.photoId]: true }))
              }
              loading="lazy"
              // objectFit="cover"
              // style={{
              //   objectFit: "cover",
              // }}
            />
            <motion.div
              className={styles.photoGridItemOverlay}
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  selectedPhoto?.photoId === photo.photoId && showOverlay
                    ? 1
                    : 0,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                opacity: {
                  duration: 0.2,
                },
              }}
            >
              <div className={styles.photoGridItemOverlayContent}>
                <h3 className={styles.photoGridItemOverlayContentText}>
                  <TextMorph>{uploadedRelativeTime || "Updating..."}</TextMorph>
                </h3>
                {type === "all" && (
                  <div className={styles.photoGridItemOverlayContentUser}>
                    {photo.memberId === event.myMembership?.memberId && (
                      <div
                        className={styles.photoGridItemOverlayContentUserText}
                      >
                        You
                      </div>
                    )}

                    {photo.memberId !== event.myMembership?.memberId && (
                      <>
                        <Image
                          src={photo.member!.avatarAlt}
                          alt={photo.member!.displayNameAlt}
                          width={24}
                          height={24}
                          className={
                            styles.photoGridItemOverlayContentUserImage
                          }
                        />
                        <div
                          className={styles.photoGridItemOverlayContentUserText}
                        >
                          {photo.member!.displayNameAlt}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
    </div>
  );
}
