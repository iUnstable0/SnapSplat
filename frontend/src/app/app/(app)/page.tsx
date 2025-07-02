import * as gql_builder from "gql-query-builder";

import Image from "next/image";

import styles from "./page.module.css";
import navbarStyles from "./components/navbar.module.css";

import { DateTime } from "luxon";

import requester from "@/gql/requester";

import type { T_User } from "@/gql/types";

import lib_error from "@/modules/error";
import clsx from "clsx";

export default async function Page() {
  let user: T_User | null = null;

  try {
    // user = (await gql.query.user()).user;

    user = (
      await requester.request({
        data: gql_builder.query({
          operation: "user",
          fields: [
            "userId",
            "email",
            "displayName",
            "avatar",
            "isEmailVerified",
            "platformRole",
          ],
        }),
        withAuth: true,
      })
    ).user as T_User;
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
        <div className={styles.menuBar}>
          <div className={styles.menuBarContent}>
            <div className={styles.menuBarItem}>
              <div className={styles.createEvent}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={styles.createEventIcon}
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 5l0 14" />
                  <path d="M5 12l14 0" />
                </svg>
              </div>
              <div className={styles.profile}>
                <Image
                  src={user.avatar}
                  alt="avatar"
                  width={42}
                  height={42}
                  className={styles.profileAvatar}
                />
              </div>
            </div>
          </div>
        </div>

        {DateTime.now()
          .setZone(timezone)
          .toLocaleString(DateTime.DATETIME_FULL)}
      </main>
    </div>
  );
}
