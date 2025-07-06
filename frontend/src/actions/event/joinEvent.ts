"use server";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import { Z_EventCode } from "@/modules/parser";
import { cookies } from "next/headers";

export default async function createEvent(
  captchaToken: string,
  code: string
): Promise<{
  success: boolean;
  message: string;
  data?: { eventId: string } | null;
}> {
  const cookieStore = await cookies();

  console.log("received data", captchaToken, code);

  const codeResult = Z_EventCode.safeParse(code);

  if (!codeResult.success) {
    return {
      success: false,
      message: "Invalid event code",
    };
  }

  let result = null;

  try {
    result = (
      await requester.request(
        {
          data: gql_builder.mutation({
            operation: "joinEvent",
            fields: ["eventId"],
            variables: {
              captchaToken: {
                value: "captchaDemo",
                required: true,
              },
              code: {
                value: codeResult.data,
                required: true,
              },
            },
          }),
          withAuth: true,
        },
        cookieStore.get("token")?.value
      )
    ).joinEvent;
  } catch (error) {
    console.error("Join event mutation failed:", error);

    return {
      success: false,
      message: "Internal server error",
    };
  }

  return {
    success: true,
    message: "Event joined successfully",
    data: result,
  };

  //   cookieStore.set("token", result.token, tokenCookieOpt);
  //   cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  //   redirect("/app", RedirectType.push);
}
