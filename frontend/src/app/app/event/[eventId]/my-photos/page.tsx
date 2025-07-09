import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Error from "@/components/error";

import { Images } from "lucide-react";

import PhotoGrid from "../_components/photo-grid";
import MyPhoto from "./_components/my-photo";

import * as gql_builder from "gql-query-builder";

import requester from "@/gql/requester";
import type { T_Event, T_EventMembership, T_EventPhoto } from "@/gql/types";

import styles from "./page.module.css";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const cookieStore = await cookies();

  const eventId = (await params).eventId;

  type T_EventData = T_Event & {
    photos: T_EventPhoto[] & {
      member: T_EventMembership;
    };
  };

  let event: T_EventData;

  try {
    event = (
      await requester.request(
        {
          data: gql_builder.query({
            operation: "event",
            fields: [
              "eventId",
              "isDraft",
              "isArchived",
              {
                myMembership: ["memberId"],
                photos: [
                  "photoId",
                  "presignedUrl",
                  "width",
                  "height",
                  "mimeType",
                  "uploadedAt",
                  "memberId",
                  {
                    member: ["displayNameAlt", "avatarAlt"],
                  },
                ],
              },
            ],
            variables: {
              eventId: { value: eventId, type: "UUID", required: true },
            },
          }),
          withAuth: true,
        },
        cookieStore.get("token")?.value
      )
    ).event as T_EventData;
  } catch (error: any) {
    console.error(
      `[/app/event/${eventId}/my-photos] Error fetching data`,
      error
    );

    if ("redirect" in error) {
      return redirect(error.redirect);
    }

    if ("status" in error) {
      switch (error.status) {
        case 400:
          return (
            <Error
              title="Event not found"
              link={{ label: "Go to home", href: "/app/me" }}
            />
          );
        case 404:
          return (
            <Error
              title="Event not found"
              link={{ label: "Go to home", href: "/app/me" }}
            />
          );
        case 500:
          console.log(error.errors);
          return (
            <Error
              title="Internal server error"
              link={{ label: "Go to home", href: "/app/me" }}
            />
          );
      }
    }

    return (
      <Error
        title="Unexpected error"
        link={{ label: "Go to home", href: "/app/me" }}
      />
    );
  }

  const filteredEvent = {
    ...event,
    photos: event.photos.filter(
      (photo) => photo.memberId === event.myMembership?.memberId
    ),
  } as T_EventData;

  console.log(filteredEvent);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>My Photos</div>

        {event.isDraft && (
          <div className={styles.galleryTitle}>
            <Images className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>
              Publish your event to get started
            </span>
          </div>
        )}

        {/* {!event.isDraft && filteredEvent.photos.length === 0 && (
          <div className={styles.galleryTitle}>
            <Images className={styles.galleryTitleIcon} />
            <span className={styles.galleryTitleText}>
              Drag and drop photos here to upload
            </span>
          </div>
        )} */}

        {/* {!event.isDraft && filteredEvent.photos.length > 0 && (
          <MyPhoto event={filteredEvent} />
        )} */}

        {!event.isDraft && <MyPhoto event={filteredEvent} />}
      </div>
    </div>
  );
}
