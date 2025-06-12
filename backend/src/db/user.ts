import validator from "validator";

import prisma from "@/db/prisma";
import lib_vet from "@/modules/vet";

export default class db_user {
  public static async getUserByEmail(email: string): Promise<any> {
    const sanitizedEmail = lib_vet.email(email);

    return prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
  }
}
