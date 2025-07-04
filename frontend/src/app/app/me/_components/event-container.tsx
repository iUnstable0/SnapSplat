"use client";

import { useEffect, useState } from "react";

import type { T_Event } from "@/gql/types";

import { AnimatePresence, motion } from "framer-motion";

import EventCard from "./event-card";
import { useBlurContext } from "./blur-context";

import ManageEvent from "@/components/panels/manage-event";

import styles from "./event-container.module.css";

export default function EventContainer({ events }: { events: T_Event[][] }) {
  const [manageEvent, setManageEvent] = useState<T_Event | null>(null);
  const [manageEventVisible, setManageEventVisible] = useState(false);

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
            event={manageEvent}
            setManageEventVisible={setManageEventVisible}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {events.map((eventGroup: T_Event[]) =>
          eventGroup.map((event: T_Event) => (
            <EventCard
              key={event.eventId}
              event={event}
              setManageEvent={setManageEvent}
              setManageEventVisible={setManageEventVisible}
            />
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
}
