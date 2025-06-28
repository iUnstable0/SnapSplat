"use server";

import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

import * as z from "zod/v4";

import gql from "@/gql";

import { Z_Email } from "@/modules/parser";

import { tokenCookieOpt, refreshTokenCookieOpt } from "@/modules/cookie";

const Z_LoginForm = z.object({
  email: Z_Email,
  password: z.string(),
});

type Z_LoginForm = z.infer<typeof Z_LoginForm>;

export default async function login(formData: FormData): Promise<void> {
  const cookieStore = await cookies();

  const data = Object.fromEntries(formData.entries()) as Z_LoginForm;

  console.log(data);

  const sanitizedData = Z_LoginForm.safeParse(data);

  if (!sanitizedData.success) {
    // return {
    //   success: false,
    //   error: sanitizedData.error.issues.map((issue) => issue.message).join(". "),
    // };

    throw new Error(
      sanitizedData.error.issues.map((issue) => issue.message).join(". ")
    );
  }

  console.log(`sanitized`, sanitizedData);

  const { email, password } = sanitizedData.data;

  let result = null;

  try {
    result = (await gql.mutation.login("d", email, password)).login;
  } catch (error) {
    console.error("Login query failed:", error);
    throw new Error("Login failed, please try again later.");
  }

  console.log(result);

  cookieStore.set("token", result.token, tokenCookieOpt);
  cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  redirect("/app", RedirectType.push);

  // return {
  //   success: true,
  // };
}
