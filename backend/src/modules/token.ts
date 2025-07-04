import Bun from "bun";
import crypto from "node:crypto";

import * as jose from "jose";
import * as z from "zod/v4";

import { DateTime } from "luxon";

import prisma from "@/db/prisma";

import lib_logger from "@/modules/logger";

import type { User, Session, SuspendedToken } from "@/generated/prisma";

import { Z_JWTAuthPayload, Z_RefreshTokenPayload } from "@/modules/parser";
import type { T_JWTAuthPayload, T_RefreshTokenPayload } from "@/modules/parser";

// const publicKey = await jose.importSPKI(process.env.PUBLIC_KEY, "EdDSA");
// const privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY, "EdDSA");

export default class lib_token {
  private static publicKey: jose.KeyObject | null = null;
  private static privateKey: jose.KeyObject | null = null;

  private static async getPublicKey() {
    if (!lib_token.publicKey) {
      lib_token.publicKey = await jose.importSPKI(
        process.env.PUBLIC_KEY,
        "EdDSA"
      );
    }
    return lib_token.publicKey;
  }

  private static async getPrivateKey() {
    if (!lib_token.privateKey) {
      lib_token.privateKey = await jose.importPKCS8(
        process.env.PRIVATE_KEY,
        "EdDSA"
      );
    }
    return lib_token.privateKey;
  }

  public static async genAuthTokenWithRefresh(
    userId: string,
    passwordSession: string,
    accountSession: string
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
        console.error(
          `${lib_logger.formatPrefix("lib_token")} Error creating session in database:`,
          error
        );

        throw new Error("Failed to create session in database");
      });

    const jwt = await lib_token.genAuthToken(
      userId,
      passwordSession,
      accountSession
    );

    return {
      token: jwt,
      refreshToken: refreshToken,
    };
  }

  public static async genAuthToken(
    userId: string,
    passwordSession: string,
    accountSession: string
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
      accountSession,
    })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setAudience("auth")
      .setExpirationTime("2h")
      .setJti(jti)
      // .setJti(crypto.randomUUID())
      .sign(await lib_token.getPrivateKey());
  }

  public static extractRefreshToken(refreshToken: string): {
    success: boolean;
    error?: string;
    data?: T_RefreshTokenPayload;
  } {
    const parts = refreshToken.split(":");

    if (parts.length !== 3) {
      return {
        success: false,
        error: `splitted refreshToken length is not 3! length=${parts.length} | ${parts.join("$")}`,
      };
    }

    const [userId, sessionId, sessionKey] = parts;

    if (!userId || !sessionId || !sessionKey) {
      return {
        success: false,
        error:
          "missing userId/sessionId/sessionKey (what the sigma this is impossible)",
      };
    }

    const data = {
      userId,
      sessionId,
      sessionKey,
    };

    try {
      Z_RefreshTokenPayload.parse(data);
    } catch (error) {
      return {
        success: false,
        error:
          "refresh token payload parsing failed (what the sigma this is impossible)",
      };
    }

    return {
      success: true,
      data,
    };
  }
  public static async validateRefreshToken(
    user: {
      sessions: Session[];
      suspendedTokens: SuspendedToken[];
    } & User,
    userId: string,
    sessionId: string,
    sessionKey: string
  ) {
    if (!userId || !sessionId || !sessionKey || !user) {
      return {
        valid: false,
        code: 0,
      };
    }

    const session = user.sessions.find(
      (session) => session.sessionId === sessionId
    );

    if (!session) {
      return {
        valid: false,
        code: 0,
      };
    }

    // Parent should check as they provides user db + fields
    // if (userId !== session.userId) {
    //   return {
    //     valid: false,
    //     code: 0,
    //   };
    // }

    if (DateTime.fromJSDate(session.expiresAt) < DateTime.now()) {
      return {
        valid: false,
        code: 1,
      };
    }

    const hashVerifyResult = await Bun.password.verify(
      sessionKey,
      session.hash,
      "argon2id"
    );

    if (!hashVerifyResult) {
      return {
        valid: false,
        code: 2,
      };
    }

    return {
      valid: true,
      code: 0,
    };
  }

  public static async checkAuthToken(
    user: {
      suspendedTokens: SuspendedToken[];
    } & User,
    payload: T_JWTAuthPayload
  ) {
    console.log("CHECKAUTHTOKEN", payload);
    if (
      user.passwordSession !== payload.passwordSession ||
      user.accountSession !== payload.accountSession
    ) {
      return false;
    }

    if (user.suspendedTokens.some((token) => token.tokenId === payload.jti)) {
      console.warn(
        `${lib_logger.formatPrefix("gql_ctx")} Token is suspended for user ${user.userId}`
      );

      return false;
    }

    return true;
  }

  // /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ Shared with frontend! Remmeber to update /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

  // WARNING: This does not check if the token is suspended!!! For the main reason of reducing DB load
  // If possible, access suspendedTokens from the relations of the user instead. or use checkAuthToken
  public static async validateAuthToken(
    WARNING_THIS_FUNCTION_DOES_NOT_DO_SUSPENDED_CHECK: string,
    token: string
  ): Promise<{
    valid: boolean;
    renew: boolean;
    payload?: T_JWTAuthPayload;
  }> {
    if (
      WARNING_THIS_FUNCTION_DOES_NOT_DO_SUSPENDED_CHECK !==
      "This function doesn't do suspended token check"
    ) {
      throw new Error(
        "WARNING: This function doesn't do suspended token check!"
      );
    }

    if (!token) {
      return { valid: false, renew: false };
    }

    try {
      z.jwt({ alg: "EdDSA" }).parse(token);

      const {
        payload: unsafePayload,
        // protectedHeader,
      }: {
        payload: T_JWTAuthPayload;
        // protectedHeader: jose.ProtectedHeaderParameters;
      } = await jose.jwtVerify(token, await lib_token.getPublicKey(), {
        audience: "auth",
      });

      const payload = Z_JWTAuthPayload.parse(unsafePayload);

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
        error
      );

      return { valid: false, renew: false };
    }
  }
}
