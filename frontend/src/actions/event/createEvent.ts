"use server";

import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import { Z_EventName, Z_EventDescription } from "@/modules/parser";

export default async function createEvent(
  captchaToken: string,
  eventName: string,
  eventDescription: string
): Promise<any> {
  console.log("received data", captchaToken, eventName, eventDescription);

  const eventNameResult = Z_EventName.safeParse(eventName);
  const descriptionResult = Z_EventDescription.safeParse(eventDescription);

  if (!eventNameResult.success) {
    return {
      success: false,
      message: "Invalid event name",
    };
  }

  if (!descriptionResult.success) {
    return {
      success: false,
      message: "Invalid description",
    };
  }

  let result = null;

  try {
    result = (
      await requester.request({
        data: gql_builder.mutation({
          operation: "createEvent",
          fields: ["eventId"],
          variables: {
            captchaToken: {
              value: "123",
              required: true,
            },
            name: {
              value: eventNameResult.data,
              required: true,
            },
            description: {
              value: descriptionResult.data,
              required: false,
            },
          },
        }),
        withAuth: true,
      })
    ).createEvent;
  } catch (error) {
    console.error("Create event query failed:", error);

    return {
      success: false,
      message: "Internal server error",
    };
  }

  return {
    success: true,
    message: "Event created successfully",
    data: result,
  };

  //   cookieStore.set("token", result.token, tokenCookieOpt);
  //   cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  //   redirect("/app", RedirectType.push);
}
