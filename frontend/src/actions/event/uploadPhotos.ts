"use server";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";

import { cookies } from "next/headers";

export default async function uploadPhotos(eventId: string, files: File[]) {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No token found in cookies");
  }

  let result = null;

  try {
    result = await requester.request(
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: gql_builder.mutation({
          operation: "uploadPhotos",
          fields: ["eventId"],
          variables: {
            eventId: {
              value: eventId,
              required: true,
            },
            files: {
              value: files,
              type: "File",
              required: true,
            },
          },
        }),
        withAuth: true,
      },
      token
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload photos");
  }

  return result;
}
