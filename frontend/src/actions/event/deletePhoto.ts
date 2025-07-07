"use server";

import * as z from "zod/v4";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import { cookies } from "next/headers";

export default async function deletePhoto(
  captchaToken: string,
  photoId: string
): Promise<{
  success: boolean;
  message: string;
  data?: { eventId: string } | null;
}> {
  const cookieStore = await cookies();

  if (!z.uuidv4().safeParse(photoId).success) {
    return {
      success: false,
      message: "Invalid photoId",
    };
  }

  let result = null;

  try {
    result = (
      await requester.request(
        {
          data: gql_builder.mutation({
            operation: "deletePhoto",
            //   fields: ["eventId"],
            variables: {
              captchaToken: {
                value: captchaToken,
                required: true,
              },
              photoId: {
                value: photoId,
                type: "UUID",
                required: true,
              },
            },
          }),
          withAuth: true,
        },
        cookieStore.get("token")?.value
      )
    ).deletePhoto;
  } catch (error) {
    console.error("Delete photo mutation failed:", error);

    return {
      success: false,
      message: "Internal server error",
    };
  }

  return {
    success: true,
    message: "Photo deleted successfully",
    data: result,
  };

  //   cookieStore.set("token", result.token, tokenCookieOpt);
  //   cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  //   redirect("/app", RedirectType.push);
}
