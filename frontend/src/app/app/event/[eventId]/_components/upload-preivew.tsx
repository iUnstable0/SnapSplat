import { useEffect, useState } from "react";

import Image from "next/image";

// import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";

// import { Trash2, X } from "lucide-react";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import type { T_FileQueue } from "../_hooks/useUploadQueue";

import styles from "./upload-preview.module.css";

export default function PhotoPreview({
  photo,
  setSelectedPhoto,
  removeItem,
}: {
  photo: T_FileQueue;
  setSelectedPhoto: (photo: T_FileQueue | null) => void;
  removeItem: (id: string) => void;
}) {
  //   const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 140,
        damping: 20,
      }}
      className={styles.photoPreview}
    >
      <div className={styles.photoPreviewToolbar}>
        <KeybindButton
          keybinds={[T_Keybind.escape]}
          onPress={() => setSelectedPhoto(null)}
          forcetheme="dark"
          className={styles.toolbarButton}
          // icon={<X />}
        >
          Close
        </KeybindButton>
        <KeybindButton
          keybinds={[T_Keybind.shift, T_Keybind.backspace]}
          onPress={() => {
            setSelectedPhoto(null);
            removeItem(photo.id);
          }}
          forcetheme="dark"
          className={styles.toolbarButton}
          dangerous={true}
        >
          Delete
        </KeybindButton>
      </div>

      <Image
        src={photo.previewUrl!}
        alt={`Pending upload ${photo.id}`}
        fill
        className={styles.photoPreviewImage}
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}
