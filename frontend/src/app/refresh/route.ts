import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import lib_error from "@/modules/error";

import { tokenCookieOpt } from "@/modules/cookie";

export async function GET(request: Request) {
  // No checks here because middleware already checked
  // Doesnt really matter anyway becasue backend also checks

  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!token || !refreshToken) {
    return lib_error.unauthorized(
      "server",
      "Unauthorized",
      "missing cookie token/refreshToken"
    );
  }

  const redirectUrl = decodeURIComponent(request.url.split("?redir=")[1]);

  // console.log(refreshToken);

  let result = null;

  try {
    result = (
      await requester.request({
        data: gql_builder.mutation({
          operation: "refreshToken",
          variables: {
            token: {
              value: token,
              required: true,
            },
            refreshToken: {
              value: refreshToken,
              required: true,
            },
          },
          fields: ["token"],
        }),
      })
    ).refreshToken;
  } catch (error: any) {
    console.error(`[/api/refresh] Error refreshing token`, error);

    if ("gql" in error) {
      if (error.gql) {
        return lib_error.unauthorized(
          "server",
          "Unauthorized",
          `unexpected gql error (gql = true): ${error.data.map((err: any) => err.message)}`
        );
      }

      return lib_error.unauthorized(
        "server",
        "Unauthorized",
        `unexpected gql error (gql = false): ${JSON.stringify(error.data)}`
      );
    }

    return lib_error.unauthorized(
      "server",
      "Unauthorized",
      `unexpected error: ${JSON.stringify(error)}`
    );
  }

  // console.log(result);

  cookieStore.set("token", result.token, tokenCookieOpt);
  // cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  // return new Response("OK", { status: 200 });
  return NextResponse.redirect(
    new URL(redirectUrl ? redirectUrl : "/app", request.url)
  );
}
