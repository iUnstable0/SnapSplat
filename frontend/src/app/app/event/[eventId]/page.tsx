import { redirect } from "next/navigation";

import Sidebar from "./components/sidebar";

import styles from "./page.module.css";

import Error from "@/components/error";

import * as gql_builder from "gql-query-builder";
import requester from "@/gql/requester";

import type { T_User, T_Event } from "@/gql/types";

export default async function Page({
  params,
}: {
  params: { eventId: string };
}) {
  const eventId = (await params).eventId;

  let data: { me: T_User; event: T_Event } = { me: null, event: null };

  try {
    data = (await requester.request({
      data: gql_builder.query({
        operation: "event",
        fields: [
          "name",
          {
            operation: "myMembership",
            fields: ["eventRole", "displayNameAlt", "avatarAlt"],
            variables: {
              eventId: { value: eventId, type: "UUID", required: true },
            },
          },
        ],
        variables: {
          eventId: { value: eventId, type: "UUID", required: true },
        },
      }),
      withAuth: true,
    })) as { me: T_User; event: T_Event };
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
        <Sidebar data={data}>
          <h1>Hello world! {JSON.stringify(data?.me)}</h1>

          <div style={{ padding: 32, fontSize: 24 }}>
            <p>
              Event ID: <strong>{eventId}</strong>
            </p>
          </div>
        </Sidebar>
      </main>
    </div>
  );
}
