import * as gql_builder from "gql-query-builder";

import MenuBar from "./components/menubar";

import styles from "./page.module.css";

import requester from "@/gql/requester";

import type { T_User } from "@/gql/types";

import lib_error from "@/modules/error";

export default async function Page() {
  let me: T_User | null = null;

  try {
    me = (
      await requester.request({
        data: gql_builder.query({
          operation: "me",
          fields: ["displayName", "avatar", "platformRole"],
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

  return (
    <div className={styles.pageWrapper}>
      <MenuBar me={me} />
      <main className={styles.mainContainer}>
        <div>No upcoming events!</div>
      </main>
    </div>
  );
}
