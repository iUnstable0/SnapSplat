import * as jose from "jose";
import Bun from "bun";
import crypto from "node:crypto";
import { DateTime } from "luxon";

import prisma from "@/db/prisma";

import lib_logger from "@/modules/logger";

import type { JWTAuthPayload } from "@/types";

const publicKey = await jose.importSPKI(process.env.PUBLIC_KEY, "EdDSA");
const privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY, "EdDSA");

export default class lib_token {
  public static async genAuthTokenWithRefresh(
    userId: string,
    passwordSession: string,
    accountSession: string,
  ): Promise<{
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

    const jwt = await lib_token.genAuthToken(
      userId,
      passwordSession,
      accountSessio,
    );

    return {
      token: jwt,
      refreshToken: refreshToken,
    };
  }

  public static async genAuthToken(
    userId: string,
    passwordSession: string,
    accountSession: string,
  ): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required to generate an auth token.");
    }

    const jti = Bun.randomUUIDv7();

    // Add the new jti to the user's activeTokenIds field

    // await prisma.user
    //   .update({
    //     where: { userId },
    //     data: {
    //       activeTokenIds: {
    //         push: jti,
    //       },
    //     },
    //   })
    //   .catch((error) => {
    //     console.error(
    //       `${lib_logger.formatPrefix("lib_token")} Error updating active token IDs for user ${userId}:`,
    //       error,
    //     );
    //
    //     throw new Error("Failed to update active token IDs in database");
    //   });

    return await new jose.SignJWT({
      userId,
      passwordSession,
      accountSessio,
    })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setAudience("auth")
      .setExpirationTime("2h")
      .setJti(jti)
      // .setJti(crypto.randomUUID())
      .sign(privateKey);
  }

  public static async validateAuthToken(token: string): Promise<{
    valid: boolean;
    renew: boolean;
    payload?: JWTAuthPayload;
  }> {
    if (!token) {
      return { valid: false, renew: false };
    }

    try {
      const {
        payload,
        protectedHeader,
      }: {
        payload: JWTAuthPayload;
        protectedHeader: jose.ProtectedHeaderParameters;
      } = await jose.jwtVerify(token, publicKey, {
        audience: "auth",
      });

      // if (!user.activeTokenIds.includes(payload.jti as string)) {
      //   console.warn(
      //     `${lib_logger.formatPrefix("lib_token")} Token JTI not found in user's active tokens:`,
      //     payload.jti,
      //   );
      //
      //   return { valid: false, renew: false };
      // }

      return {
        valid: true,
        renew:
          DateTime.fromSeconds(payload.exp) <
          DateTime.now().plus({ minute: 10 }),
        payload,
      };
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        return { valid: false, renew: true };
      }

      console.error(
        `${lib_logger.formatPrefix("lib_token")} Error validating auth token:`,
        error,
      );

      return { valid: false, renew: false };
    }
  }
}
