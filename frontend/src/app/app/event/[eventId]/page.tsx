import Sidebar from "./components/sidebar";

import styles from "./page.module.css";

import lib_error from "@/modules/error";

import gql from "@/gql";

import type { T_User } from "@/gql/types";

export default async function Page({
  params,
}: {
  params: { eventId: string };
}) {
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

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <Sidebar user={user}>
          <h1>Hello world! {JSON.stringify(user)}</h1>

          <div style={{ padding: 32, fontSize: 24 }}>
            <p>
              Event ID: <strong>{params.eventId}</strong>
            </p>
          </div>
        </Sidebar>
      </main>
    </div>
  );
}
