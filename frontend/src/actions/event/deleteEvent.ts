"use server";

import * as z from "zod/v4";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import { cookies } from "next/headers";

export default async function deleteEvent(
  captchaToken: string,
  eventId: string
): Promise<{
  success: boolean;
  message: string;
  data?: { eventId: string } | null;
}> {
  const cookieStore = await cookies();

  if (!z.uuidv4().safeParse(eventId).success) {
    return {
      success: false,
      message: "Invalid eventId",
    };
  }

  let result = null;

  try {
    result = (
      await requester.request(
        {
          data: gql_builder.mutation({
            operation: "deleteEvent",
            //   fields: ["eventId"],
            variables: {
              captchaToken: {
                value: "123",
                required: true,
              },
              eventId: {
                value: eventId,
                required: true,
              },
            },
          }),
          withAuth: true,
        },
        cookieStore.get("token")?.value
      )
    ).createEvent;
  } catch (error) {
    console.error("Delete event query failed:", error);

    return {
      success: false,
      message: "Internal server error",
    };
  }

  return {
    success: true,
    message: "Event deleted successfully",
    data: result,
  };

  //   cookieStore.set("token", result.token, tokenCookieOpt);
  //   cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  //   redirect("/app", RedirectType.push);
}
