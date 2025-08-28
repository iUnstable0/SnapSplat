"use client";

import { useEffect, useState } from "react";

import type { T_Event, T_EventMembership } from "@/gql/types";

import { AnimatePresence, motion } from "framer-motion";

import EventCard from "./event-card";
import { useBlurContext } from "@/components/blur-context";

import ManageEvent from "@/components/panels/manage-event";

import styles from "./event-container.module.css";

type T_EventData = T_Event & {
  myMembership: T_EventMembership;
};

export default function EventContainer({
  events,
}: {
  events: T_EventData[][];
}) {
  const [manageEvent, setManageEvent] = useState<T_EventData | null>(null);
  const [manageEventVisible, setManageEventVisible] = useState<boolean>(false);
  const { setIsBlurred } = useBlurContext();

  useEffect(() => {
    if (manageEventVisible) {
      setIsBlurred(true);
    } else {
      setIsBlurred(false);
    }
  }, [manageEventVisible]);

  return (
    <motion.div
      className={styles.eventsContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      key="event-container"
    >
      <AnimatePresence>
        {manageEventVisible && (
          <ManageEvent
            event={manageEvent!}
            setManageEventVisible={setManageEventVisible}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {events.map((eventGroup) =>
          eventGroup.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              manageEvent={manageEvent}
              setManageEvent={setManageEvent}
              setManageEventVisible={setManageEventVisible}
            />
          )),
        )}
      </AnimatePresence>
    </motion.div>
  );
}
