import * as z from "zod/v4";

import { Z_DisplayName, Z_Email } from "@/modules/parser";

export const Z_User = z.object({
  displayName: Z_DisplayName,
  email: Z_Email,
  profilePicture: z.string(),
});
