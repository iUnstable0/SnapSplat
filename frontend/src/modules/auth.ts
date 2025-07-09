import { DateTime } from "luxon";
import * as jose from "jose";
import * as z from "zod/v4";

import { Z_JWTAuthPayload } from "@/modules/parser";
import type { T_JWTAuthPayload } from "@/modules/parser";

// const publicKey = await jose.importSPKI(process.env.PUBLIC_KEY, "EdDSA");

export default class lib_auth {
  // /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ Shared with backend! Remmeber to update /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

  private static publicKey: jose.KeyObject | null = null;

  private static async getPublicKey() {
    if (!this.publicKey) {
      this.publicKey = await jose.importSPKI(process.env.PUBLIC_KEY, "EdDSA");
    }

    return this.publicKey;
  }

  // Middleware is meant for quick token validation
  // Valid tokens doesnt mean valid authentication, the token could
  // be suspended in the database.
  public static async validateAuthToken(token: string): Promise<{
    valid: boolean;
    renew: boolean;
    payload?: T_JWTAuthPayload;
  }> {
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
      } = await jose.jwtVerify(token, await this.getPublicKey(), {
        audience: "auth",
      });

      const payload = Z_JWTAuthPayload.parse(unsafePayload);

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

      console.error(`[lib_auth] Error validating auth token:`, error);

      return {
        valid: false,
        renew: false,
      };
    }
  }
}
