"use server";

import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

import * as z from "zod/v4";

import requester from "@/gql/requester";
import * as gql_builder from "gql-query-builder";

import { Z_Email } from "@/modules/parser";

import { tokenCookieOpt, refreshTokenCookieOpt } from "@/modules/cookie";

export default async function login(
  captchaToken: string,
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const cookieStore = await cookies();

  const sanitizedEmail = Z_Email.safeParse(email);

  if (!sanitizedEmail.success) {
    return {
      success: false,
      message: "Please check your credentials and try again.",
    };
  }

  const sanitizedPassword = z.string().min(8).safeParse(password);

  if (!sanitizedPassword.success) {
    return {
      success: false,
      message: "Please check your credentials and try again.",
    };
  }

  let result = null;

  try {
    result = (
      await requester.request({
        data: gql_builder.mutation({
          operation: "login",
          fields: ["token", "refreshToken"],
          variables: {
            captchaToken: {
              value: captchaToken,
              required: true,
            },
            email: {
              value: sanitizedEmail.data,
              type: "EmailAddress",
              required: true,
            },
            password: {
              value: sanitizedPassword.data,
              required: true,
            },
          },
        }),
      })
    ).login;
  } catch (error) {
    console.log("Login mutation failed:", JSON.stringify(error, null, 2));

    return {
      success: false,
      message: "Please check your credentials and try again.",
    };
  }

  if (!result) {
    return {
      success: false,
      message: "Please check your credentials and try again.",
    };
  }

  if (!result.token || !result.refreshToken) {
    return {
      success: false,
      message: "Please check your credentials and try again.",
    };
  }

  // console.log("LOGIN RESULT", result);

  cookieStore.set("token", result.token, tokenCookieOpt);
  cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  return {
    success: true,
    message: "Login successful",
  };
}
