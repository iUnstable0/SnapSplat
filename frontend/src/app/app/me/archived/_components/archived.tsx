"use client";

import { AnimatePresence, motion } from "framer-motion";

import { T_Event, T_EventMembership } from "@/gql/types";

import { TextMorph } from "@/components/ui/mp_text-morph";

import EventContainer from "@/app/app/me/_components/event-container";

import styles from "@/app/app/me/page.module.css";

type T_EventData = T_Event & {
  myMembership: T_EventMembership;
};

export default function Archived({
  archived,
  myArchived,
}: {
  archived: T_EventData[];
  myArchived: T_EventData[];
}) {
  const archivedCount = archived.length + myArchived.length;

  return (
    <>
      <AnimatePresence mode="popLayout">
        {archivedCount > 0 && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            key="archived-count"
            className={styles.pageTitle}
          >
            <TextMorph>
              {`${archivedCount} archived event${archivedCount === 1 ? "" : "s"} found`}
            </TextMorph>
          </motion.h1>
        )}

        {archivedCount > 0 && (
          <EventContainer events={[myArchived, archived]} />
        )}

        {archivedCount === 0 && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            key="no-archived"
            className={styles.pageMiddleText}
          >
            No archived events found
          </motion.h1>
        )}
      </AnimatePresence>
    </>
  );
}
