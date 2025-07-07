"use client";

import { AnimatePresence, motion } from "framer-motion";

import { T_Event, T_EventMembership } from "@/gql/types";

import { TextMorph } from "@/components/ui/mp_text-morph";

import EventContainer from "./event-container";

import styles from "@/app/app/me/page.module.css";

type T_EventData = T_Event & {
  myMembership: T_EventMembership;
};

export default function UpcomingEvents({
  activeEvents,
  myPublishedEvents,
}: {
  activeEvents: T_EventData[];
  myPublishedEvents: T_EventData[];
}) {
  const activeEventsCount = activeEvents.length + myPublishedEvents.length;

  return (
    <AnimatePresence mode="popLayout">
      {activeEventsCount > 0 && (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          key="active-events-count"
          className={styles.pageTitle}
        >
          <TextMorph>
            {`${activeEventsCount} event${activeEventsCount === 1 ? "" : "s"}`}
          </TextMorph>
        </motion.h1>
      )}

      {activeEventsCount > 0 && (
        <EventContainer events={[myPublishedEvents, activeEvents]} />
      )}

      {activeEventsCount === 0 && (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          key="no-active-events"
          className={styles.pageMiddleText}
        >
          No upcoming events found
        </motion.h1>
      )}
    </AnimatePresence>
  );
}
