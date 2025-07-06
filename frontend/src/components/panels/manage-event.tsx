import { motion } from "motion/react";

import { T_Event } from "@/gql/types";

import EventBanner from "@/components/event-banner";

import styles from "./manage-event.module.css";
import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
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
          <EventBanner data={{ event }} edit={true} />
          <ProgressiveBlur
            direction={"top"}
            className={styles.topBlur}
            blurIntensity={1}
          />

          <div className={styles.optionsContainer}>
            <div className={styles.manageEventContentHeader}>
              <div className={styles.manageEventContentHeaderTitle}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
