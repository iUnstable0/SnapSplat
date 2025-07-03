import * as z from "zod/v4";

import { Z_DisplayName, Z_Email } from "@/modules/parser";

export const Z_User = z.object({
  displayName: Z_DisplayName,
  email: Z_Email,
  avatar: z.url(),
  isEmailVerified: z.boolean(),
  platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  eventProfile: z.object({
    displayNameAlt: Z_DisplayName,
    avatarAlt: z.url(),
  }),
});

export type T_User = z.infer<typeof Z_User>;

export const Z_Platform = z.object({
  isSetupCompleted: z.boolean(),
});

export type T_Platform = z.infer<typeof Z_Platform>;

export const Z_EventMembership = z.object({
  eventRole: z.enum(["HOST", "COHOST", "ATTENDEE"]),

  displayNameAlt: Z_DisplayName,
  avatarAlt: z.url(),

  joinedAt: z.date(),
  isApproved: z.boolean(),
});

export const Z_Event = z.object({
  hostId: z.uuidv4(),
  eventId: z.uuidv4(),
  // We dont validate the name and description
  // because they are not user controlled
  // and if in the future we change the name/description constraints
  name: z.string(),
  description: z.string(),
  startsAt: z.date(),
  endsAt: z.date(),
  isDraft: z.boolean(),
  isArchived: z.boolean(),

  myMembership: Z_EventMembership,
});

export type T_Event = z.infer<typeof Z_Event>;
