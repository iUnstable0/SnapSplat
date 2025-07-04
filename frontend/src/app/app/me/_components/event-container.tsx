"use client";

import type { T_Event } from "@/gql/types";

import { AnimatePresence } from "framer-motion";

import EventCard from "./event-card";

import styles from "./event-container.module.css";

export default function EventContainer({ events }: { events: T_Event[][] }) {
  return (
    <div className={styles.eventsContainer}>
      <AnimatePresence>
        {events.map((eventGroup: T_Event[]) =>
          eventGroup.map((event: T_Event) => (
            <EventCard key={event.eventId} event={event} />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
