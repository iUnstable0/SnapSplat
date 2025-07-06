"use server";

import { cookies } from "next/headers";

import * as z from "zod/v4";

import requester from "@/gql/requester";
import * as gql_builder from "gql-query-builder";

import {
  Z_Email,
  Z_Password,
  Z_DisplayName,
  Z_SetupKey,
} from "@/modules/parser";
import { tokenCookieOpt, refreshTokenCookieOpt } from "@/modules/cookie";

export default async function register(
  captchaToken: string,
  displayName: string,
  email: string,
  password: string,
  setupKey?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const cookieStore = await cookies();

  const sanitizedEmail = Z_Email.safeParse(email);
  const sanitizedPassword = Z_Password.safeParse(password);
  const sanitizedDisplayName = Z_DisplayName.safeParse(displayName);

  if (
    !sanitizedEmail.success ||
    !sanitizedPassword.success ||
    !sanitizedDisplayName.success
  ) {
    throw new Error("Invalid data format");
  }

  const sanitizedSetupKey = Z_SetupKey.safeParse(setupKey);

  if (setupKey) {
    if (!sanitizedSetupKey.success) {
      return {
        success: false,
        message: "Invalid setup key",
      };
    }
  }

  let result = null;

  try {
    result = (
      await requester.request({
        data: gql_builder.mutation({
          operation: "register",
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
            displayName: {
              value: sanitizedDisplayName.data,
              required: true,
            },
            setupKey: {
              value: setupKey,
              required: false,
            },
          },
        }),
      })
    ).register;
  } catch (error) {
    console.log("Register mutation failed:", JSON.stringify(error, null, 2));

    return {
      success: false,
      message: "Please try again later.",
    };
  }

  if (!result) {
    return {
      success: false,
      message: "Please try again later.",
    };
  }

  if (!result.token || !result.refreshToken) {
    return {
      success: false,
      message: "Please try again later.",
    };
  }

  cookieStore.set("token", result.token, tokenCookieOpt);
  cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  return {
    success: true,
    message: "Registration successful",
  };
}
