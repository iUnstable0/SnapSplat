import * as z from "zod/v4";

import { Z_DisplayName, Z_Email } from "@/modules/parser";

export const Z_Event: z.ZodType<any> = z.lazy(() =>
  z.object({
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

    createdAt: z.date(),

    hostMember: z.promise(Z_EventMembership),
    hostUser: z.promise(Z_User),

    memberships: z.array(z.promise(Z_EventMembership)),

    myMembership: z.promise(Z_EventMembership),
  })
);

export type T_Event = z.infer<typeof Z_Event>;

export const Z_User: z.ZodType<any> = z.lazy(() =>
  z.object({
    userId: z.uuidv4(),
    email: Z_Email,
    displayName: Z_DisplayName,
    avatar: z.url(),
    isEmailVerified: z.boolean(),
    platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),

    events: z.array(z.promise(Z_Event)),
    myEvents: z.array(z.promise(Z_Event)),
  })
);

export type T_User = z.infer<typeof Z_User>;

export const Z_EventMembership: z.ZodType<any> = z.lazy(() =>
  z.object({
    memberId: z.uuidv4(),
    eventId: z.uuidv4(),

    eventRole: z.enum(["HOST", "COHOST", "ATTENDEE"]),

    displayNameAlt: Z_DisplayName,
    avatarAlt: z.url(),

    joinedAt: z.date(),
    isApproved: z.boolean(),

    user: z.promise(Z_User),
  })
);

export type T_EventMembership = z.infer<typeof Z_EventMembership>;

export const Z_Platform = z.object({
  isSetupCompleted: z.boolean(),
});

export type T_Platform = z.infer<typeof Z_Platform>;
