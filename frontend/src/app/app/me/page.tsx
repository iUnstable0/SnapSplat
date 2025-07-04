import { redirect } from "next/navigation";

import Error from "@/components/error";

import * as gql_builder from "gql-query-builder";

import MenuBar from "./components/menubar";

import styles from "./page.module.css";

import requester from "@/gql/requester";
import type { T_Event, T_User } from "@/gql/types";

import lib_error from "@/modules/error";

export default async function Page() {
  let me: T_User = null;

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
    console.error(`[/app] Error fetching data`, error);

    if ("redirect" in error) {
      return redirect(error.redirect);
    }

    if ("status" in error) {
      switch (error.status) {
        case 500:
          console.log(error.errors);
          return <Error title="Internal server error" />;
      }

      return (
        <Error
          title="Unexpected error"
          link={{ label: "Go to home", href: "/app/me" }}
        />
      );
    }
  }

  const activeEvents = me.events.filter((event: T_Event) => !event.isArchived);
  const myPublishedEvents = me.myEvents.filter(
    (event: T_Event) => !event.isDraft
  );

  const activeEventsCount = activeEvents.length + myPublishedEvents.length;

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        {activeEventsCount === 0 && (
          <div className={styles.emptyState}>
            <p>No upcoming events found</p>
          </div>
        )}
        {activeEventsCount > 0 && (
          <div className={styles.eventsContainer}>
            <h2>{activeEventsCount} events</h2>
          </div>
        )}
      </main>
    </div>
  );
}
