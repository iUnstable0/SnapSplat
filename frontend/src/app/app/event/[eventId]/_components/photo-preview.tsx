import { useState } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";

import deletePhoto from "@/actions/event/deletePhoto";

import { KeybindButton, T_Keybind } from "@/components/keybind";
import Confirmation from "@/components/confirmation";

import type { T_EventPhoto } from "@/gql/types";

import styles from "./photo-preview.module.css";

export default function PhotoPreview({
  photo,
  setSelectedPhoto,
  ownsPhoto,
}: {
  photo: T_EventPhoto;
  setSelectedPhoto: (photo: T_EventPhoto | null) => void;
  ownsPhoto: boolean;
}) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationLoading, setDeleteConfirmationLoading] =
    useState(false);

  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={styles.photoPreview}
    >
      <div className={styles.photoPreviewToolbar}>
        <KeybindButton
          keybinds={[T_Keybind.escape]}
          onPress={() => setSelectedPhoto(null)}
          forcetheme="dark"
          className={styles.toolbarButton}
          disabled={buttonDisabled}
        >
          Close
        </KeybindButton>
        {ownsPhoto && (
          <KeybindButton
            keybinds={[T_Keybind.shift, T_Keybind.backspace]}
            onPress={() => {
              setDeleteLoading(true);
              setButtonDisabled(true);

              setDeleteConfirmationOpen(true);
            }}
            forcetheme="dark"
            className={styles.toolbarButton}
            dangerous={true}
            loading={deleteLoading}
            loadingText="Deleting..."
            disabled={buttonDisabled}
          >
            Delete
          </KeybindButton>
        )}
      </div>

      <AnimatePresence>
        {deleteConfirmationOpen && (
          <Confirmation
            title="Delete Photo"
            description="Are you sure you want to delete this photo?"
            confirmText="Delete"
            confirmLoadingText="Deleting..."
            // confirmIcon={<Trash2 />}
            // cancelIcon={<X />}
            forcetheme="dark"
            confirmKeybinds={[T_Keybind.shift, T_Keybind.enter]}
            onConfirm={async () => {
              await deletePhoto("captchaDemo", photo.photoId);

              setDeleteConfirmationOpen(false);

              setTimeout(() => {
                setDeleteLoading(false);
                setButtonDisabled(false);

                setSelectedPhoto(null);

                router.refresh();
              }, 1000);
            }}
            onCancel={() => {
              setDeleteConfirmationOpen(false);

              setTimeout(() => {
                // setOverlayLoading(false);
                setDeleteLoading(false);
                setButtonDisabled(false);
              }, 1000);
            }}
            confirmationLoading={deleteConfirmationLoading}
            setConfirmationLoading={setDeleteConfirmationLoading}
            dangerous={true}
          />
        )}
      </AnimatePresence>

      <Image
        src={photo.presignedUrl!}
        alt={`Event ${photo.eventId}`}
        fill
        className={styles.photoPreviewImage}
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}
