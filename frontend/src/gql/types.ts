// Types of data received from the backend
// Sync with backend/db/types.ts
// Field names should follow the gql schema.gql

import * as z from "zod/v4";

// Import input parsers
import { Z_Email } from "@/modules/parser";

type User = {
  userId: string;

  email: string;
  displayName: string;
  platformRole: "SUPER_ADMIN" | "ADMIN" | "USER";

  avatar: string;

  isEmailVerified: boolean;

  events: T_Event[] | undefined;
  myEvents: T_Event[] | undefined;
};

export const Z_User: z.ZodType<User> = z.object({
  userId: z.uuidv4(),

  email: Z_Email,
  displayName: z.string(),
  platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),

  avatar: z.url(),

  isEmailVerified: z.boolean(),

  events: z
    .array(z.lazy(() => Z_Event))
    .optional()
    .default(undefined),
  myEvents: z
    .array(z.lazy(() => Z_Event))
    .optional()
    .default(undefined),
});

export type T_User = z.infer<typeof Z_User>;

type Event = {
  eventId: string;
  name: string;
  description: string;

  icon: string;
  cover: string;
  banner: string;

  startsAt: string;
  endsAt: string;

  isDraft: boolean;
  isArchived: boolean;

  createdAt: string;

  hostUser: T_User | undefined;

  hostMember: T_EventMembership | undefined;

  memberships: T_EventMembership[] | undefined;
  invites: T_EventInvite[] | undefined;

  myMembership: T_EventMembership | undefined;
};

export const Z_Event: z.ZodType<Event> = z.object({
  eventId: z.uuidv4(),

  // We dont validate the name and description
  // because they are not user controlled
  // and if in the future we change the name/description constraints
  name: z.string(),
  description: z.string(),

  icon: z.url(),
  cover: z.url(),
  banner: z.url(),

  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),

  isDraft: z.boolean(),
  isArchived: z.boolean(),

  createdAt: z.iso.datetime(),

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

  myMembership: z
    .lazy(() => Z_EventMembership)
    .optional()
    .default(undefined),
});

export type T_Event = z.infer<typeof Z_Event>;

type EventMembership = {
  eventId: string;

  eventRole: "HOST" | "COHOST" | "ATTENDEE";

  displayNameAlt: string;
  avatarAlt: string;

  joinedAt: string;
  isApproved: boolean;

  event: T_Event | undefined;

  userId: string;
  user: T_User | undefined;

  memberId: string;
};

export const Z_EventMembership: z.ZodType<EventMembership> = z.object({
  eventId: z.uuidv4(),

  eventRole: z.enum(["HOST", "COHOST", "ATTENDEE"]),

  displayNameAlt: z.string(),
  avatarAlt: z.url(),

  joinedAt: z.iso.datetime(),
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
});

export type T_EventMembership = z.infer<typeof Z_EventMembership>;

type EventInvite = {
  eventId: string;
  inviteId: string;
  inviteCode: string;

  role: "HOST" | "COHOST" | "ATTENDEE";
  requireApproval: boolean;

  createdAt: string;
  expiresAt: string;

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

  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),

  maxUses: z.number(),
  uses: z.number(),

  event: z
    .lazy(() => Z_Event)
    .optional()
    .default(undefined),
});

export type T_EventInvite = z.infer<typeof Z_EventInvite>;

type EventPhoto = {
  photoId: string;
  eventId: string;

  key: string;
  width: number;
  height: number;
  mimeType: string;

  uploadedAt: string;

  presignedUrl: string | null;

  memberId: string;
  member: T_EventMembership | undefined;

  userId: string;
  user: T_User | undefined;
};

export const Z_EventPhoto: z.ZodType<EventPhoto> = z.object({
  photoId: z.uuidv4(),
  eventId: z.uuidv4(),

  key: z.string(),
  width: z.number(),
  height: z.number(),
  mimeType: z.string(),

  uploadedAt: z.iso.datetime(),

  presignedUrl: z.string().nullable(),

  memberId: z.uuidv4(),
  member: z
    .lazy(() => Z_EventMembership)
    .optional()
    .default(undefined),

  userId: z.uuidv4(),
  user: z
    .lazy(() => Z_User)
    .optional()
    .default(undefined),
});

export type T_EventPhoto = z.infer<typeof Z_EventPhoto>;

export const Z_Platform = z.object({
  isSetupCompleted: z.boolean(),
});

export type T_Platform = z.infer<typeof Z_Platform>;
