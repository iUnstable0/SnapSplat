import { redirect } from "next/navigation";

import EventBanner from "@/components/event-banner";

import Error from "@/components/error";
import Spinner from "@/components/spinner";

import * as gql_builder from "gql-query-builder";
import requester from "@/gql/requester";
import type { T_Event } from "@/gql/types";

import styles from "./page.module.css";
import { cookies } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const cookieStore = await cookies();

  const eventId = (await params).eventId;

  type T_EventData = T_Event;

  let event: T_EventData;

  try {
    event = (
      await requester.request(
        {
          data: gql_builder.query({
            operation: "event",
            fields: [
              "eventId",
              "name",
              "description",
              "icon",
              "cover",
              "banner",
              // "isDraft",
              // "isArchived",
              // {
              //   myMembership: ["eventRole", "displayNameAlt", "avatarAlt"],
              // },
            ],
            variables: {
              eventId: { value: eventId, type: "UUID", required: true },
            },
          }),
          withAuth: true,
        },
        cookieStore.get("token")?.value
      )
    ).event as T_EventData;
  } catch (error: any) {
    console.error(`[/app/event/${eventId}] Error fetching data`, error);

    if ("redirect" in error) {
      return redirect(error.redirect);
    }

    if ("status" in error) {
      switch (error.status) {
        case 400:
          return (
            <Error
              title="Event not found"
              link={{ label: "Go to home", href: "/app/me" }}
            />
          );
        case 404:
          return (
            <Error
              title="Event not found"
              link={{ label: "Go to home", href: "/app/me" }}
            />
          );
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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <EventBanner event={event} />

        <div className={styles.liveFeed}>
          <div className={styles.liveFeedHeader}>
            <h1 className={styles.liveFeedTitle}>Welcome!</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
