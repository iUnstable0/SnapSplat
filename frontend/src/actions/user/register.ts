"use server";

import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

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

const Z_RegisterForm = z.object({
  email: Z_Email,
  password: Z_Password,
  confirmPassword: Z_Password,
  displayName: Z_DisplayName,
  setupKey: Z_SetupKey.optional(),
});

type Z_RegisterForm = z.infer<typeof Z_RegisterForm>;

export default async function register(formData: FormData): Promise<void> {
  const cookieStore = await cookies();

  const data = Object.fromEntries(formData.entries()) as Z_RegisterForm;

  const sanitizedData = Z_RegisterForm.safeParse(data);

  if (!sanitizedData.success) {
    throw new Error(
      sanitizedData.error.issues.map((issue) => issue.message).join(". ")
    );
  }

  const { email, password, confirmPassword, displayName, setupKey } =
    sanitizedData.data;

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
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
              value: "123",
              required: true,
            },
            email: {
              value: email,
              type: "EmailAddress",
              required: true,
            },
            password: {
              value: password,
              required: true,
            },
            displayName: {
              value: displayName,
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
    console.error("Register query failed:", error);
    throw new Error("Register failed, please try again later.");
  }

  cookieStore.set("token", result.token, tokenCookieOpt);
  cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  redirect("/app/me", RedirectType.push);
}
