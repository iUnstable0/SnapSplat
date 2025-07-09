"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";

import PhotoGrid from "../../_components/photo-grid";
import PhotoPreview from "../../_components/photo-preview";

import type { T_Event, T_EventPhoto, T_EventMembership } from "@/gql/types";

type T_EventData = T_Event & {
  photos: T_EventPhoto[] & {
    member: T_EventMembership;
  };
};

export default function Gallery({ event }: { event: T_EventData }) {
  const [selectedPhoto, setSelectedPhoto] = useState<T_EventPhoto | null>(null);

  return (
    <div>
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoPreview
            photo={selectedPhoto}
            setSelectedPhoto={setSelectedPhoto}
            ownsPhoto={selectedPhoto.memberId === event.myMembership?.memberId}
          />
        )}
      </AnimatePresence>
      <PhotoGrid
        event={event}
        type="all"
        onPhotoClick={(photo) => {
          setSelectedPhoto(photo);
        }}
      />
    </div>
  );
}
