import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import type { T_Platform } from "@/gql/types";

import Error from "@/components/error";

import Setup from "./_components/setup";

export default async function Page() {
  const cookieStore = await cookies();

  let platform: T_Platform | null = null;

  try {
    platform = (
      await requester.request(
        {
          data: gql_builder.query({
            operation: "platform",
            fields: ["isSetupCompleted"],
          }),
        },
        cookieStore.get("token")?.value
      )
    ).platform;
  } catch (error: any) {
    console.error(`[/app/me/setup] Error fetching platform`, error);

    if ("redirect" in error) {
      return redirect(error.redirect);
    }

    if ("status" in error) {
      switch (error.status) {
        case 500:
          console.log(error.errors);
          return <Error title="Internal server error" />;
      }

      return (
        <Error
          title="Unexpected error"
          link={{ label: "Go to home", href: "/app/me" }}
        />
      );
    }
  }

  // if (platform?.isSetupCompleted) {
  //   // return redirect("/app/me", RedirectType.replace);

  //   return (
  //     <Error
  //       title="Setup completed"
  //       link={{ label: "Go to dashboard", href: "/app/me" }}
  //     />
  //   );
  // }

  return <Setup setupCompleted={platform?.isSetupCompleted} />;
}
