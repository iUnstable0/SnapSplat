import * as z from "zod/v4";

import { Z_Email, Z_DisplayName } from "@/modules/parser";

export const Z_Avatar = z
  .string()
  .pipe(
    z.transform((val) =>
      val === "/placeholder.png"
        ? `https://api.dicebear.com/9.x/initials/svg?seed=USER_DISPLAY_NAME`
        : val
    )
  );

export const Z_Platform = z.object({
  isSetupCompleted: z.string().pipe(z.transform((val) => val === "true")),
});

export type T_Platform = z.infer<typeof Z_Platform>;

export const Z_User = z.object({
  email: Z_Email,
  displayName: Z_DisplayName,
  platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),

  isEmailVerified: z.boolean(),

  avatar: Z_Avatar,

  userId: z.uuidv4(),
});

export type T_User = z.infer<typeof Z_User>;

export const Z_EventMembership = z.object({
  eventRole: z.enum(["HOST", "COHOST", "ATTENDEE"]),

  displayNameAlt: Z_DisplayName,
  avatarAlt: Z_Avatar,

  joinedAt: z.date(),
  isApproved: z.boolean(),
});

export type T_EventMembership = z.infer<typeof Z_EventMembership>;
