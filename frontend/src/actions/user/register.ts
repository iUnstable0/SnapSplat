"use server";

import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

import * as z from "zod/v4";

import gql from "@/gql";

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
      await gql.mutation.register("d", email, password, displayName, setupKey)
    ).register;
  } catch (error) {
    console.error("Register query failed:", error);
    throw new Error("Register failed, please try again later.");
  }

  cookieStore.set("token", result.token, tokenCookieOpt);
  cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  redirect("/app", RedirectType.push);
}
