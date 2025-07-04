import { redirect } from "next/navigation";

import Sidebar from "./_components/sidebar";

import styles from "./layout.module.css";

import Error from "@/components/error";

import * as gql_builder from "gql-query-builder";
import requester from "@/gql/requester";

import type { T_User, T_Event } from "@/gql/types";

export default async function Page({
  params,
  children,
}: {
  params: { eventId: string };
  children: React.ReactNode;
}) {
  const eventId = (await params).eventId;

  let data: { event: T_Event } = { event: null };

  try {
    data = await requester.request({
      data: gql_builder.query({
        operation: "event",
        fields: [
          "eventId",
          "name",
          "description",
          "isDraft",
          "isArchived",
          {
            myMembership: ["eventRole", "displayNameAlt", "avatarAlt"],
            // variables: {
            //   eventId: { value: eventId, type: "UUID", required: true },
            // },
          },
        ],
        variables: {
          eventId: { value: eventId, type: "UUID", required: true },
        },
      }),
      withAuth: true,
    });
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
      <main className={styles.mainContainer}>
        <Sidebar data={data}>{children}</Sidebar>
      </main>
    </div>
  );
}
