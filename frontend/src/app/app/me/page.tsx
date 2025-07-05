import { redirect } from "next/navigation";

import * as gql_builder from "gql-query-builder";

import MenuBar from "./_components/menubar";

import UpcomingEvents from "./_components/upcoming-events";

import Error from "@/components/error";

import styles from "./page.module.css";

import requester from "@/gql/requester";
import type { T_Event, T_User } from "@/gql/types";

import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();

  let data: { me: T_User } = { me: null };

  try {
    data = await requester.request(
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
    );
  } catch (error: any) {
    console.error(`[/app/me] Error fetching data`, error);

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

  const activeEvents = data.me.events.filter(
    (event: T_Event) => !event.isArchived
  );
  const myPublishedEvents = data.me.myEvents.filter(
    (event: T_Event) => !event.isDraft
  );

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={data.me} />
      <main className={styles.mainContainer}>
        <UpcomingEvents
          activeEvents={activeEvents}
          myPublishedEvents={myPublishedEvents}
        />
      </main>
    </div>
  );
}
