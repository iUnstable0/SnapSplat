import { redirect } from "next/navigation";
import * as gql_builder from "gql-query-builder";

import MenuBar from "../_components/menubar";
import EventContainer from "../_components/event-container";

import Error from "@/components/error";

import styles from "../page.module.css";

import requester from "@/gql/requester";

import type { T_Event, T_User } from "@/gql/types";

import lib_role from "@/modules/role";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();

  let me: T_User | null = null;

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
      )
    ).me as T_User;
  } catch (error: any) {
    console.error(`[/app/me/drafts] Error fetching data`, error);

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

  const drafts = me.events.filter(
    (event: T_Event) =>
      event.isDraft === true && lib_role.event_isCohost(event.myMembership)
  );

  const myDrafts = me.myEvents.filter(
    (event: T_Event) => event.isDraft === true
  );

  const draftsCount = myDrafts.length + drafts.length;

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        {draftsCount > 0 && (
          <h1 className={styles.pageTitle}>
            {`${draftsCount} draft${draftsCount === 1 ? "" : "s"} found`}
          </h1>
        )}

        {draftsCount > 0 && <EventContainer events={[myDrafts, drafts]} />}

        {draftsCount === 0 && (
          <h1 className={styles.pageMiddleText}>No drafts found</h1>
        )}
      </main>
    </div>
  );
}
