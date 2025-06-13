import * as jose from "jose";
import Bun from "bun";
import crypto from "node:crypto";
import { DateTime } from "luxon";

const privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY, "EdDSA");

export default class lib_token {
  public static async genAuthToken(userId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const sessionKey = crypto.randomBytes(32).toString("hex");

    const hashedSessionKey = await Bun.password.hash(sessionKey, {
      algorithm: "argon2id",
    });

    const sessionData = {
      userId,
      sessionId,
      hash: hashedSessionKey,
      expiresAt: DateTime.now().plus({ days: 7 }).toISO(,
    };

    const jwt = await new jose.SignJWT({ userId })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setAudience("auth")
      .setExpirationTime("2h")
      .setJti(Bun.randomUUIDv7())
      .sign(privateKey);

    return jwt;
  }
}
