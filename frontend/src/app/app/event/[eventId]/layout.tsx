import { BlurContextProvider } from "@/components/blur-context";

import { redirect } from "next/navigation";

import Sidebar from "./_components/sidebar";

import styles from "./layout.module.css";

import Error from "@/components/error";

import * as gql_builder from "gql-query-builder";
import requester from "@/gql/requester";

import type {
  T_Event,
  T_User,
  T_EventMembership,
  T_EventInvite,
} from "@/gql/types";

import { cookies } from "next/headers";

export default async function Page({
  params,
  children,
}: {
  params: Promise<{ eventId: string }>;
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const eventId = (await params).eventId;

  type T_EventData = T_Event & {
    hostMember: T_User;
    memberships: T_EventMembership[];
    myMembership: T_EventMembership;
    invites: T_EventInvite[];
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
              "name",
              "description",
              "isDraft",
              "isArchived",
              "icon",
              "cover",
              "banner",
              {
                memberships: [
                  "memberId",
                  "eventRole",
                  "avatarAlt",
                  "displayNameAlt",
                  "joinedAt",
                  "isApproved",
                ],
                myMembership: ["eventRole", "displayNameAlt", "avatarAlt"],
                invites: [
                  "inviteId",
                  "inviteCode",
                  "role",
                  "requireApproval",
                  "createdAt",
                  "maxUses",
                  "uses",
                  "expiresAt",
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
    console.error(`[/app/event/${eventId}] Error fetching data`, error);

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

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <BlurContextProvider>
          <Sidebar event={event}>{children}</Sidebar>
        </BlurContextProvider>
      </main>
    </div>
  );
}
