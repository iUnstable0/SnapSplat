// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ Shared with frontend! Remmeber to update /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

import * as z from "zod/v4";

export const Z_JWTAuthPayload = z.object({
  userId: z.uuidv4(),
  passwordSession: z.uuidv4(),
  accountSession: z.uuidv4(),
  jti: z.uuidv7(),
  iat: z.number(),
  exp: z.number(),
  aud: z.string(),
});

export type T_JWTAuthPayload = z.infer<typeof Z_JWTAuthPayload>;

export const Z_Email = z.email({ message: "Invalid email address" }).trim();

export const Z_Password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(10000, {
    message: "Password must be at most 10000 characters long",
  })
  .regex(/[a-zA-Z]/, {
    message: "Password must contain at least one letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must contain at least one special character",
  })
  .trim();

export const Z_DisplayName = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-zA-Z0-9 ]+$/, {
    message: "Display name can only contain letters, numbers, and spaces",
  })
  .refine((name) => !name.includes("  "), {
    message: "Display name cannot contain consecutive spaces",
  })
  .refine((name) => !name.startsWith(" ") && !name.endsWith(" "), {
    message: "Display name cannot start or end with a space",
  });

export const Z_RefreshTokenPayload = z.object({
  userId: z.uuidv4(),
  sessionId: z.uuidv4(),
  sessionKey: z.string(),
});

export type T_RefreshTokenPayload = z.infer<typeof Z_RefreshTokenPayload>;

export const Z_EventName = z
  .string()
  .min(3, {
    message: "Event name can't be shorter than 3 characters",
  })
  .max(50, {
    message: "Event name can't be longer than 50 characters",
  })
  .trim();

export const Z_EventDescription = z
  .string()
  .max(500, {
    message: "Event description can't be longer than 500 characters",
  })
  .trim()
  .default("");

export const Z_UpdateEvent = z.object({
  name: Z_EventName.optional(),
  description: Z_EventDescription.optional(),
  isDraft: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export type T_UpdateEvent = z.infer<typeof Z_UpdateEvent>;

export const Z_InviteCode = z
  .string()
  .length(6, {
    message: "Invite code must be 6 characters long",
  })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "Invite code can only contain letters and numbers",
  });

export type T_InviteCode = z.infer<typeof Z_InviteCode>;
