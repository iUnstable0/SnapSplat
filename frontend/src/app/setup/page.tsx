import { redirect, RedirectType } from "next/navigation";

import * as gql_builder from "gql-query-builder";

import setup from "@/actions/user/register";

import lib_error from "@/modules/error";

import requester from "@/gql/requester";

import type { T_Platform } from "@/gql/types";

export default async function Page() {
  let platform: T_Platform | null = null;

  try {
    platform = (
      await requester.request({
        data: gql_builder.query({
          operation: "platform",
          fields: ["isSetupCompleted"],
        }),
      })
    ).platform;
  } catch (error: any) {
    console.error(`[/setup] Error fetching platform`, error);

    if ("gql" in error) {
      if (error.gql) {
        console.error(
          `[/setup] Unexpected gql error (gql = true): ${error.data.map((err: any) => err.message)}`
        );

        // return redirect("/error/500", RedirectType.replace);

        return lib_error.internal_server_error(
          "client",
          "Internal Server Error",
          `unexpected gql error (gql = true): ${error.data.map((err: any) => err.message)}`
        );
      }

      console.error(
        `[/setup] Unexpected gql error (gql = false): ${JSON.stringify(error.data)}`
      );

      return lib_error.internal_server_error(
        "client",
        "Internal Server Error",
        `unexpected gql error (gql = false): ${JSON.stringify(error.data)}`
      );
    }

    console.error(`[/setup] Unexpected error: ${JSON.stringify(error)}`);

    return lib_error.internal_server_error(
      "client",
      "Internal Server Error",
      `unexpected error: ${JSON.stringify(error)}`
    );
  }

  if (platform?.isSetupCompleted) {
    return redirect("/login", RedirectType.replace);
  }

  return (
    <div>
      <h1>Setup platform</h1>
      <form action={setup}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
          />
        </div>
        <div>
          <label htmlFor="setupKey">Setup key</label>
          <input type="password" id="setupKey" name="setupKey" required />
        </div>
        <div>
          <label htmlFor="">Display Name</label>
          <input type="name" id="displayName" name="displayName" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
