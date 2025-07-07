"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";

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
  forcetheme,
  confirmKeybinds,
  cancelKeybinds,
  dim,
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
  forcetheme?: "light" | "dark";
  dim?: boolean;
  confirmKeybinds?: T_Keybind[];
  cancelKeybinds?: T_Keybind[];
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
      className={clsx(styles.confirmation, dim && styles.confirmationDim)}
      key={title}
      // initial={{ opacity: 0, scale: 0.9 }}
      // animate={{ opacity: 1, scale: 1 }}
      // exit={{ opacity: 0, scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
        // type: "spring",
        // stiffness: 120,
        // damping: 20,
      }}
      style={{
        color: forcetheme
          ? forcetheme === "dark"
            ? "#f9f9f9"
            : "#1d1d1f"
          : "var(--sp-text-color)",
      }}
    >
      <div className={styles.confirmationContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <motion.div
          className={styles.actions}
          layout
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
          style={{
            width: "100%",
            gap: "50px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: "calc(100% * 0.05)",
            paddingLeft: "calc(100% * 0.05)",
            paddingRight: "calc(100% * 0.05)",
          }}
        >
          <KeybindButton
            keybinds={cancelKeybinds || [T_Keybind.escape]}
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
            forcetheme={forcetheme}
            icon={cancelIcon}
            iconClassName={styles.actionIcon}
            textClassName={styles.actionText}
          >
            {cancelText || "Cancel"}
          </KeybindButton>

          <KeybindButton
            keybinds={confirmKeybinds || [T_Keybind.shift, T_Keybind.enter]}
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
            forcetheme={forcetheme}
            disabled={confirmationLoading}
            loading={confirmLoading}
            loadingText={confirmLoadingText}
            icon={confirmIcon}
            iconClassName={styles.actionIcon}
            textClassName={styles.actionText}
          >
            {confirmText || "Confirm"}
          </KeybindButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
