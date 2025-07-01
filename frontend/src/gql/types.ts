import * as z from "zod/v4";

import { Z_DisplayName, Z_Email } from "@/modules/parser";

export const Z_User = z.object({
  displayName: Z_DisplayName,
  email: Z_Email,
  avatar: z.string(),
  isEmailVerified: z.boolean(),
  platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
});

export type T_User = z.infer<typeof Z_User>;

export const Z_Platform = z.object({
  isSetupCompleted: z.boolean(),
});

export type T_Platform = z.infer<typeof Z_Platform>;
