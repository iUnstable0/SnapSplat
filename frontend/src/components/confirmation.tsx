"use client";

import { useEffect, useState } from "react";

import { motion } from "motion/react";

import { KeybindButton, T_Keybind } from "./keybind";

import styles from "./confirmation.module.css";

export default function Confirmation({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmLoadingText,
  cancelLoadingText,
  dangerous = false,
  confirmIcon,
  cancelIcon,
  confirmationLoading,
  setConfirmationLoading,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmLoadingText?: string;
  cancelLoadingText?: string;
  dangerous?: boolean;
  confirmIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
  confirmationLoading?: boolean;
  setConfirmationLoading?: (loading: boolean) => void;
}) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // const [buttonDisabled, setButtonDisabled] = useState(
  //   confirmLoading || cancelLoading
  // );

  useEffect(() => {
    // setButtonDisabled(confirmLoading || cancelLoading);
    setConfirmationLoading?.(confirmLoading || cancelLoading);
  }, [confirmLoading, cancelLoading]);

  return (
    <motion.div
      className={styles.confirmation}
      key={title}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
      }}
    >
      <div className={styles.confirmationContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <KeybindButton
            keybinds={[T_Keybind.escape]}
            onPress={async () => {
              if (cancelLoadingText) {
                setCancelLoading(true);

                setTimeout(() => {
                  try {
                    onCancel();
                  } catch (error) {
                    console.error(error);
                  }

                  setTimeout(() => {
                    setCancelLoading(false);
                  }, 1000);
                }, 1000);
              } else {
                onCancel();
              }
            }}
            dangerous={!dangerous}
            disabled={confirmationLoading}
            loading={cancelLoading}
            loadingText={cancelLoadingText}
            forcetheme="dark"
            icon={cancelIcon}
            iconClassName={styles.actionIcon}
            textClassName={styles.actionText}
          >
            {cancelText || "Cancel"}
          </KeybindButton>

          <KeybindButton
            keybinds={[T_Keybind.shift, T_Keybind.enter]}
            onPress={async () => {
              if (confirmLoadingText) {
                setConfirmLoading(true);

                setTimeout(() => {
                  try {
                    onConfirm();
                  } catch (error) {
                    console.error(error);
                  }

                  setTimeout(() => {
                    setConfirmLoading(false);
                  }, 1000);
                }, 1000);
              } else {
                onConfirm();
              }
            }}
            dangerous={dangerous}
            forcetheme="dark"
            disabled={confirmationLoading}
            loading={confirmLoading}
            loadingText={confirmLoadingText}
            icon={confirmIcon}
            iconClassName={styles.actionIcon}
            textClassName={styles.actionText}
          >
            {confirmText || "Confirm"}
          </KeybindButton>
        </div>
      </div>
    </motion.div>
  );
}
