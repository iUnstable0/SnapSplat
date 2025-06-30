import * as z from "zod/v4";

import Sidebar from "@/app/app/components/sidebar";

import styles from "./page.module.css";

import lib_error from "@/modules/error";

import gql from "@/gql";

import { Z_User } from "@/gql/schemas/types";

type Z_User = z.infer<typeof Z_User>;

export default async function Page() {
  // const gql = createGQL();

  let user: Z_User | null = null;

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

  // console.log("User data fetched successfully:", user);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <Sidebar user={user}>
          <h1>Hello world! {user.email}</h1>
        </Sidebar>
      </main>
    </div>
  );
}
