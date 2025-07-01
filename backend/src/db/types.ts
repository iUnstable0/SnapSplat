import * as z from "zod/v4";

import { Z_Email, Z_DisplayName } from "@/modules/parser";

export const Z_Platform = z.object({
  isSetupCompleted: z.string().pipe(z.transform((val) => val === "true")),
});

export type T_Platform = z.infer<typeof Z_Platform>;

export const Z_User = z.object({
  displayName: Z_DisplayName,
  email: Z_Email,
  avatar: z
    .string()
    .pipe(
      z.transform((val) =>
        val === "/placeholder.png"
          ? `https://api.dicebear.com/9.x/initials/svg?seed=USER_DISPLAY_NAME`
          : val
      )
    ),
  isEmailVerified: z.boolean(),
  platformRole: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
});

export type T_User = z.infer<typeof Z_User>;
