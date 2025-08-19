"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";

import { Images, ImageUp, X } from "lucide-react";

import PhotoGrid from "../../_components/photo-grid";
import PhotoPreview from "../../_components/photo-preview";

import type { T_Event, T_EventPhoto, T_EventMembership } from "@/gql/types";

import styles from "./gallery.module.css";

// import PhotoUpload from "../../_components/photo-upload";

type T_EventData = T_Event & {
  photos: T_EventPhoto[] & {
    member: T_EventMembership;
  };
};

export default function Gallery({ event }: { event: T_EventData }) {
  const [selectedPhoto, setSelectedPhoto] = useState<T_EventPhoto | null>(null);

  return (
    // <div>
    //   <AnimatePresence>
    //     {selectedPhoto && (
    //       <PhotoPreview
    //         photo={selectedPhoto}
    //         setSelectedPhoto={setSelectedPhoto}
    //         ownsPhoto={selectedPhoto.memberId === event.myMembership?.memberId}
    //       />
    //     )}
    //   </AnimatePresence>
    //   <PhotoGrid
    //     event={event}
    //     type="all"
    //     onPhotoClick={(photo) => {
    //       setSelectedPhoto(photo);
    //     }}
    //   />
    // </div>

    <>
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoPreview
            photo={selectedPhoto}
            setSelectedPhoto={setSelectedPhoto}
            ownsPhoto={selectedPhoto.memberId === event.myMembership?.memberId}
          />
        )}
      </AnimatePresence>

      {event.photos.length === 0 && (
        <div className={styles.galleryTitle}>
          <Images className={styles.galleryTitleIcon} />
          <span className={styles.galleryTitleText}>
            Drag and drop files here to upload
          </span>
        </div>
      )}

      {/* <PhotoUpload
      event={event}
      selectedPhoto={selectedPhoto}
      setSelectedPhoto={setSelectedPhoto}
    > */}
      <PhotoGrid
        event={event}
        type="all"
        onPhotoClick={(photo) => {
          setSelectedPhoto(photo);
        }}
      />
      {/* </PhotoUpload> */}
    </>
  );
}
