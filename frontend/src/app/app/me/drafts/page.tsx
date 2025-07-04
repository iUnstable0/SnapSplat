import * as gql_builder from "gql-query-builder";

import MenuBar from "../components/menubar";
import EventCard from "../components/event-card";

import styles from "../page.module.css";

import requester from "@/gql/requester";

import type { T_Event, T_User } from "@/gql/types";

import lib_error from "@/modules/error";
import { AnimatePresence } from "motion/react";

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
              myEvents: [
                "eventId",
                "name",
                "description",
                "isDraft",
                "isArchived",
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

  const myDrafts = me.myEvents.filter(
    (event: T_Event) => event.isDraft === true
  );

  const myDraftsCount = myDrafts.length;

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        <h1 className={styles.pageTitle}>
          {myDraftsCount > 0
            ? `${myDraftsCount} draft${myDraftsCount === 1 ? "" : "s"} found`
            : "No drafts found"}
        </h1>

        {myDraftsCount > 0 && (
          <div className={styles.eventsContainer}>
            <AnimatePresence>
              {myDrafts.map((event: T_Event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
