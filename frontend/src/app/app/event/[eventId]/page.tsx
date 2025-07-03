import Sidebar from "./components/sidebar";

import styles from "./page.module.css";

import lib_error from "@/modules/error";

import * as gql_builder from "gql-query-builder";
import requester from "@/gql/requester";

import type { T_User, T_Event } from "@/gql/types";

export default async function Page({
  params,
}: {
  params: { eventId: string };
}) {
  const eventId = (await params).eventId;

  let data: { me: T_User; event: T_Event } | null = null;

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
    console.error(`[/app] Error fetching data`, error);

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

  const user = data?.me;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <Sidebar data={data}>
          <h1>Hello world! {JSON.stringify(user)}</h1>

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
