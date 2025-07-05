import { motion } from "motion/react";

import { T_Event } from "@/gql/types";

import styles from "./manage-event.module.css";

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
      {event.name}
    </motion.div>
  );
}
