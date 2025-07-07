import { redirect } from "next/navigation";

import * as gql_builder from "gql-query-builder";
// import { DateTime } from "luxon";

import Error from "@/components/error";

import MenuBar from "../_components/menubar";

import styles from "../page.module.css";

import requester from "@/gql/requester";

import type { T_Event, T_User } from "@/gql/types";

import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();

  type T_Me = T_User & {
    events: T_Event[];
    myEvents: T_Event[];
  };

  let me: T_Me | null = null;

  try {
    me = (
      await requester.request(
        {
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
                    myMembership: ["eventRole"],
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
                    myMembership: ["eventRole"],
                  },
                ],
              },
            ],
          }),
          withAuth: true,
        },
        cookieStore.get("token")?.value
      )
    ).me as T_Me;
  } catch (error: any) {
    console.error(`[/app/me/past-events] Error fetching data`, error);

    if ("redirect" in error) {
      return redirect(error.redirect);
    }

    if ("status" in error) {
      switch (error.status) {
        case 500:
          console.log(error.errors);
          return <Error title="Internal server error" />;
      }
    }

    return (
      <Error
        title="Unexpected error"
        link={{ label: "Go to home", href: "/app/me" }}
      />
    );
  }

  // const pastEvents = me.events.filter(
  //   (event: T_Event) =>
  //     !event.isArchived && DateTime.fromISO(event.endsAt) < DateTime.now()
  // );

  // const myPastEvents = me.myEvents.filter(
  //   (event: T_Event) =>
  //     !event.isArchived && DateTime.fromISO(event.endsAt) < DateTime.now()
  // );

  // const pastEventsCount = pastEvents.length + myPastEvents.length;

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        {/* {pastEventsCount > 0 && (
          <h1 className={styles.pageTitle}>
            {pastEventsCount} event{pastEventsCount === 1 ? "" : "s"}
          </h1>
        )} */}

        {/* {pastEventsCount > 0 && (
          <div className={styles.eventsContainer}>
            <AnimatePresence>
              {myPastEvents.map((event: T_Event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
              {pastEvents.map((event: T_Event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
            </AnimatePresence>
          </div>
        )} */}

        {/* {pastEventsCount === 0 && (
          <h1 className={styles.pageMiddleText}>No past events found</h1>
        )} */}

        <h1 className={styles.pageMiddleText}>Under construction</h1>
      </main>
    </div>
  );
}
