"use server";

import { cookies } from "next/headers";

import { redirect, RedirectType } from "next/navigation";

import * as z from "zod/v4";

import requester from "@/gql/requester";

import { Z_EventName, Z_EventDescription } from "@/modules/parser";
import lib_error from "@/modules/error";

export default async function createEvent(
  captchaToken: string,
  eventName: string,
  description: string
): Promise<any> {
  const cookieStore = await cookies();

  console.log("received data", captchaToken, eventName, description);

  const eventNameResult = Z_EventName.safeParse(eventName);
  const descriptionResult = Z_EventDescription.safeParse(description);

  if (!eventNameResult.success || !descriptionResult.success) {
      
}

  //   let result = null;

  //   try {
  //     result = (
  //       await gql.mutation.register("d", email, password, displayName, setupKey)
  //     ).register;
  //   } catch (error) {
  //     console.error("Register query failed:", error);
  //     throw new Error("Register failed, please try again later.");
  //   }

  //   cookieStore.set("token", result.token, tokenCookieOpt);
  //   cookieStore.set("refresh_token", result.refreshToken, refreshTokenCookieOpt);

  //   redirect("/app", RedirectType.push);
}
