import Navbar from "../components/navbar";

import styles from "./page.module.css";

import { DateTime } from "luxon";

import gql from "@/gql";

import type { T_User } from "@/gql/types";

import lib_error from "@/modules/error";

export default async function Page() {
  let user: T_User | null = null;

  try {
    user = (await gql.query.user()).user;
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

  // get user timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {DateTime.now()
          .setZone(timezone)
          .toLocaleString(DateTime.DATETIME_FULL)}
      </main>
    </div>
  );
}
