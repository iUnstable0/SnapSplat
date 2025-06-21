import * as jose from "jose";
import Bun from "bun";
import crypto from "node:crypto";
import { DateTime } from "luxon";

import prisma from "@/db/prisma";

const publicKey = await jose.importSPKI(process.env.PUBLIC_KEY, "EdDSA");
const privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY, "EdDSA");

export default class lib_token {
  public static async genAuthTokenWithRefresh(userId: string): Promise<{
    token: string;
    refreshToken: string;
  }> {
    if (!userId) {
      throw new Error("User ID is required to generate an auth token.");
    }

    const sessionId = crypto.randomUUID();
    const sessionKey = crypto.randomBytes(32).toString("hex");

    const refreshToken = `${userId}:${sessionId}:${sessionKey}`;

    const hashedSessionKey = await Bun.password.hash(sessionKey, {
      algorithm: "argon2id",
    });

    const sessionData = {
      userId,
      sessionId: sessionId,
      hash: hashedSessionKey,
      expiresAt: DateTime.now().plus({ days: 7 }).toISO(),
    };

    await prisma.session
      .create({
        data: sessionData,
      })
      .then(async (session) => {
        console.log("Session created in database:", session);
      })
      .catch((error) => {
        console.error("Error creating session in database:", error);

        throw new Error("Failed to create session in database");
      });

    const jwt = await lib_token.genAuthToken(userId);

    return {
      token: jwt,
      refreshToken: refreshToken,
    };
  }

  public static async genAuthToken(userId: string): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required to generate an auth token.");
    }

    const token = await new jose.SignJWT({ userId })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setAudience("auth")
      .setExpirationTime("2h")
      // .setJti(Bun.randomUUIDv7())
      .setJti(crypto.randomUUID())
      .sign(privateKey);

    return token;
  }

  public static async verifyAuthToken(token: string): Promise<{
    valid: boolean;
    renew: boolean;
  }> {
    if (!token) {
      return { valid: false, renew: false };
    }

    const { payload, protectedHeader } = await jose.jwtVerify(
      token,
      publicKey,
      {
        audience: "auth",
      },
    );

    console.log("Token payload:", payload);
    console.log("Token protected header:", protectedHeader);

    return {
      valid: true,
      renew: false,
    };
  }
}
