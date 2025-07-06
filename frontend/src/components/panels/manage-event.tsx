import { motion } from "motion/react";

import { T_Event } from "@/gql/types";

import EventBanner from "@/components/event-banner";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./manage-event.module.css";
import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";

import Toaster from "@/components/toaster";
import { X } from "lucide-react";

export default function ManageEvent({
  event,
  setManageEventVisible,
}: {
  event: T_Event;
  setManageEventVisible: (visible: boolean) => void;
}) {
  // alert(event.name);
  return (
    <motion.div
      className={styles.manageEvent}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        opacity: {
          duration: 0.2,
        },
      }}
      onClick={() => {
        setManageEventVisible(false);
      }}
    >
      <motion.div
        className={styles.manageEventContainer}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles.manageEventContent}>
          <Toaster />

          <ProgressiveBlur
            direction={"bottom"}
            className={styles.bottomBlur}
            blurIntensity={1}
          />

          <div className={styles.manageEventEscapeButtonContainer}>
            <KeybindButton
              keybinds={[T_Keybind.escape]}
              onPress={() => {
                setManageEventVisible(false);
              }}
            >
              Close
            </KeybindButton>
          </div>

          <EventBanner data={{ event }} edit={true} />

          <ProgressiveBlur
            direction={"top"}
            className={styles.topBlur}
            blurIntensity={1}
          />

          <div className={styles.optionsContainer}>
            <div className={styles.manageEventContentHeader}>
              <div className={styles.manageEventContentHeaderTitle}>
                dwwddw wdadw
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
