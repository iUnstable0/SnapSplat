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
    sessionKey: z.string()
  })
