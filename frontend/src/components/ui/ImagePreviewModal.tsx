import React from "react";
import Image from "next/image";
import styles from "./ImagePreviewModal.module.css";

interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  onDelete?: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  onClose,
  imageSrc,
  imageAlt = "",
  imageWidth,
  imageHeight,
  onDelete,
}) => {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button
        className={styles.closeButton}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        ×
      </button>
      <button
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        aria-label="Delete"
      >
        🗑️
      </button>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={imageWidth}
        height={imageHeight}
        className={styles.modalImage}
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
};

export default ImagePreviewModal;
