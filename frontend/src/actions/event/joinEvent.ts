"use server";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import { Z_InviteCode } from "@/modules/parser";
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

  const codeResult = Z_InviteCode.safeParse(code);

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
                value: captchaToken,
                required: true,
              },
              inviteCode: {
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
  } catch (error: any) {
    console.error("Join event mutation failed:", error);

    return {
      success: false,
      message: error.errors[0].message,
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
