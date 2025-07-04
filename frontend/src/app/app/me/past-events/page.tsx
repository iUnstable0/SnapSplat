import * as gql_builder from "gql-query-builder";

import MenuBar from "../components/menubar";

import styles from "../page.module.css";

import requester from "@/gql/requester";

import type { T_Event, T_User } from "@/gql/types";

import lib_error from "@/modules/error";
import Link from "next/link";
import { DateTime } from "luxon";

export default async function Page() {
  let me: T_User | null = null;

  try {
    me = (
      await requester.request({
        data: gql_builder.query({
          operation: "me",
          fields: [
            "displayName",
            "avatar",
            "platformRole",
            {
              events: [
                "eventId",
                "name",
                "description",
                "isDraft",
                "isArchived",
                "startsAt",
                "endsAt",
                {
                  hostMember: ["displayNameAlt"],
                },
              ],
              myEvents: [
                "eventId",
                "name",
                "description",
                "isDraft",
                "isArchived",
                "startsAt",
                "endsAt",
                {
                  hostMember: ["displayNameAlt"],
                },
              ],
            },
          ],
        }),
        withAuth: true,
      })
    ).me as T_User;
  } catch (error: any) {
    console.error(`[/app] Error fetching user data`, error);

    if ("gql" in error) {
      if (error.gql) {
        return lib_error.unauthorized(
          "client",
          "Unauthorized",
          `unexpected gql error (gql = true): ${error.data.map((err: any) => err.message)}`
        );
      }

      return lib_error.unauthorized(
        "client",
        "Unauthorized",
        `unexpected gql error (gql = false): ${JSON.stringify(error.data)}`
      );
    }

    return lib_error.unauthorized(
      "client",
      "Unauthorized",
      `unexpected error: ${JSON.stringify(error)}`
    );
  }

  const pastEvents = me.events.filter(
    (event: T_Event) =>
      event.isArchived || DateTime.fromISO(event.endsAt) < DateTime.now()
  );

  const myPastEvents = me.myEvents.filter(
    (event: T_Event) =>
      event.isArchived || DateTime.fromISO(event.endsAt) < DateTime.now()
  );

  const pastEventsCount = pastEvents.length + myPastEvents.length;

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        {pastEventsCount === 0 && (
          <div className={styles.emptyState}>
            <p>No past events found</p>
          </div>
        )}
        {pastEventsCount > 0 && (
          <div className={styles.eventsContainer}>
            <h2>{pastEventsCount} events</h2>
          </div>
        )}
      </main>
    </div>
  );
}
