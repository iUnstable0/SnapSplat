import validator from "validator";

import prisma from "@/db/prisma";
import lib_sanitize from "@/modules/sanitize.ts";

export default class db_user {
  public static async getUserByEmail(email: string): Promise<any> {
    const sanitizedEmail = lib_sanitize.email(email);

    console.log(`Fetching user with email: ${sanitizedEmail}`);

    return prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
  }
}
