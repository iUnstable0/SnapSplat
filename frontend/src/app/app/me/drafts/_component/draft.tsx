"use client";

import { AnimatePresence, motion } from "framer-motion";

import { T_Event, T_EventMembership } from "@/gql/types";

import { TextMorph } from "@/components/ui/mp_text-morph";

import EventContainer from "@/app/app/me/_components/event-container";

import styles from "@/app/app/me/page.module.css";

type T_EventData = T_Event & {
  myMembership: T_EventMembership;
};

export default function Draft({
  drafts,
  myDrafts,
}: {
  drafts: T_EventData[];
  myDrafts: T_EventData[];
}) {
  const draftsCount = myDrafts.length + drafts.length;

  return (
    <>
      <AnimatePresence mode="popLayout">
        {draftsCount > 0 && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            key="drafts-count"
            className={styles.pageTitle}
          >
            <TextMorph>
              {`${draftsCount} draft${draftsCount === 1 ? "" : "s"} found`}
            </TextMorph>
          </motion.h1>
        )}

        {draftsCount > 0 && <EventContainer events={[myDrafts, drafts]} />}

        {draftsCount === 0 && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            key="no-drafts"
            className={styles.pageMiddleText}
          >
            No drafts found
          </motion.h1>
        )}
      </AnimatePresence>
    </>
  );
}
