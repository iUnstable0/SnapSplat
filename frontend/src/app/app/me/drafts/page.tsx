import { redirect } from "next/navigation";

import * as gql_builder from "gql-query-builder";

import MenuBar from "../_components/menubar";

import Draft from "./_components/draft";

import Error from "@/components/error";

import styles from "../page.module.css";

import requester from "@/gql/requester";

import type { T_Event, T_EventMembership, T_User } from "@/gql/types";

import { cookies } from "next/headers";

type T_EventData = T_Event & {
  myMembership: T_EventMembership;
};

type T_Me = T_User & {
  // events: T_EventData[];
  myEvents: T_EventData[];
};

export default async function Page() {
  const cookieStore = await cookies();

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
                // events: [
                //   "eventId",
                //   "name",
                //   "description",
                //   "isDraft",
                //   "isArchived",
                //   "icon",
                //   "cover",
                //   "banner",
                //   {
                //     hostMember: ["displayNameAlt"],
                //     myMembership: ["eventRole"],
                //   },
                // ],
                myEvents: [
                  "eventId",
                  "name",
                  "description",
                  "isDraft",
                  "isArchived",
                  "icon",
                  "cover",
                  "banner",
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
    console.error(`[/app/me/drafts] Error fetching data`, error);

    if ("redirect" in error) {
      return redirect(error.redirect);
    }

    if ("status" in error) {
      switch (error.status) {
        case 500:
          console.log(error.errors);
          return (
            <Error
              title="Internal server error"
              link={{ label: "Go to home", href: "/app/me" }}
            />
          );
      }
    }

    return (
      <Error
        title="Unexpected error"
        link={{ label: "Go to home", href: "/app/me" }}
      />
    );
  }

  // const drafts = me.events.filter(
  //   (event) =>
  //     event.isDraft === true && lib_role.event_isCohost(event.myMembership!)
  // );

  const myDrafts = me.myEvents.filter((event) => event.isDraft === true);

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        <Draft myDrafts={myDrafts as T_EventData[]} />
      </main>
    </div>
  );
}
