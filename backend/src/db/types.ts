// Types of data received from the database
// Sync with frontend/src/gql/types.ts

// Reflects the database schema
// Only include fields relevant to the frontend defined in the schema.gql
// Field names should follow the database schema

import * as z from "zod/v4";

import { Z_Email } from "@/modules/parser";
import type { EventRole, PlatformRole } from "@/generated/prisma";

export const Z_Avatar = z
  .string()
  .pipe(
    z.transform((val, ctx) =>
      val === "/placeholder.png"
        ? `https://api.dicebear.com/9.x/initials/svg?seed=USER_DISPLAY_NAME`
        : val
    )
  );

export const Z_EventIcon = z
  .string()
  .pipe(
    z.transform((val) =>
      val === "/event-icon-placeholder.png"
        ? `https://picsum.photos/seed/eventIcon-EVENT_ID/128/128`
        : val
    )
  );

export const Z_EventCover = z
  .string()
  .pipe(
    z.transform((val) =>
      val === "/event-cover-placeholder.png"
        ? `https://picsum.photos/seed/eventCover-EVENT_ID/420/300`
        : val
    )
  );

export const Z_EventBanner = z
  .string()
  .pipe(
    z.transform((val) =>
      val === "/event-banner-placeholder.png"
        ? `https://picsum.photos/seed/eventBanner-EVENT_ID/1400/1400`
        : val
    )
  );

export const Z_Platform = z.object({
  isSetupCompleted: z.string().pipe(z.transform((val) => val === "true")),
});

export type T_Platform = z.infer<typeof Z_Platform>;

type User = {
  userId: string;

  email: string;
  displayName: string;
  platformRole: PlatformRole;

  avatar: string;

  isEmailVerified: boolean;

  memberships: T_EventMembership[] | undefined;
  hostedEvents: T_Event[] | undefined;
};

export const Z_User: z.ZodType<User> = z
  .object({
    userId: z.uuidv4(),

    email: Z_Email,
    displayName: z.string(),
    platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),

    avatar: Z_Avatar,

    isEmailVerified: z.boolean(),

    memberships: z
      .array(z.lazy(() => Z_EventMembership))
      .optional()
      .default(undefined),
    hostedEvents: z
      .array(z.lazy(() => Z_Event))
      .optional()
      .default(undefined),
  })
  .transform((val) => {
    return {
      ...val,
      avatar: val.avatar.replaceAll(
        "USER_DISPLAY_NAME",
        encodeURIComponent(val.displayName)
      ),
    };
  });

export type T_User = z.infer<typeof Z_User>;

type Event = {
  eventId: string;
  name: string;
  description: string;

  icon: string;
  cover: string;
  banner: string;

  startsAt: Date;
  endsAt: Date;

  isDraft: boolean;
  isArchived: boolean;

  createdAt: Date;

  hostUser: T_User | undefined;

  hostMember: T_EventMembership | undefined;

  memberships: T_EventMembership[] | undefined;
  invites: T_EventInvite[] | undefined;
};

export const Z_Event: z.ZodType<Event> = z
  .object({
    eventId: z.uuidv4(),
    name: z.string(),
    description: z.string(),

    icon: Z_EventIcon,
    cover: Z_EventCover,
    banner: Z_EventBanner,

    startsAt: z.date(),
    endsAt: z.date(),

    isDraft: z.boolean(),
    isArchived: z.boolean(),

    createdAt: z.date(),

    hostUser: z
      .lazy(() => Z_User)
      .optional()
      .default(undefined),

    hostMember: z
      .lazy(() => Z_EventMembership)
      .optional()
      .default(undefined),

    memberships: z
      .array(z.lazy(() => Z_EventMembership))
      .optional()
      .default(undefined),
    invites: z
      .array(z.lazy(() => Z_EventInvite))
      .optional()
      .default(undefined),
  })
  .transform((val) => {
    return {
      ...val,
      icon: val.icon.replaceAll("EVENT_ID", encodeURIComponent(val.eventId)),
      cover: val.cover.replaceAll("EVENT_ID", encodeURIComponent(val.eventId)),
      banner: val.banner.replaceAll(
        "EVENT_ID",
        encodeURIComponent(val.eventId)
      ),
    };
  });

export type T_Event = z.infer<typeof Z_Event>;

type EventMembership = {
  eventId: string;

  eventRole: EventRole;

  displayNameAlt: string;
  avatarAlt: string;

  joinedAt: Date;
  isApproved: boolean;

  event: T_Event | undefined;

  userId: string;
  user: T_User | undefined;

  memberId: string;
};

export const Z_EventMembership: z.ZodType<EventMembership> = z
  .object({
    eventId: z.uuidv4(),

    eventRole: z.enum(["HOST", "COHOST", "ATTENDEE"]),

    displayNameAlt: z.string(),
    avatarAlt: Z_Avatar,

    joinedAt: z.date(),
    isApproved: z.boolean(),

    event: z
      .lazy(() => Z_Event)
      .optional()
      .default(undefined),

    userId: z.uuidv4(),

    user: z
      .lazy(() => Z_User)
      .optional()
      .default(undefined),

    memberId: z.uuidv4(),
  })
  .transform((val) => {
    return {
      ...val,
      avatarAlt: val.avatarAlt.replaceAll(
        "USER_DISPLAY_NAME",
        encodeURIComponent(val.displayNameAlt)
      ),
    };
  });

export type T_EventMembership = z.infer<typeof Z_EventMembership>;

type EventInvite = {
  eventId: string;
  inviteId: string;
  inviteCode: string;

  role: EventRole;
  requireApproval: boolean;

  createdAt: Date;
  expiresAt: Date;

  maxUses: number;
  uses: number;

  event: T_Event | undefined;
};

export const Z_EventInvite: z.ZodType<EventInvite> = z.object({
  eventId: z.uuidv4(),
  inviteId: z.uuidv4(),
  inviteCode: z.string(),

  role: z.enum(["HOST", "COHOST", "ATTENDEE"]),
  requireApproval: z.boolean(),

  createdAt: z.date(),
  expiresAt: z.date(),

  maxUses: z.number(),
  uses: z.number(),

  event: z
    .lazy(() => Z_Event)
    .optional()
    .default(undefined),
});

export type T_EventInvite = z.infer<typeof Z_EventInvite>;
