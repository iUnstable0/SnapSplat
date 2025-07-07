import * as z from "zod/v4";
import Bun from "bun";
import crypto from "node:crypto";

import { GraphQLError } from "graphql";

import prisma from "@/db/prisma";
import { PlatformRole } from "@/generated/prisma";
import type { Session, SuspendedToken, User } from "@/generated/prisma";

import lib_logger from "@/modules/logger";
import lib_captcha from "@/modules/captcha";
import lib_vet from "@/modules/vet";
import lib_token from "@/modules/token";
import lib_error from "@/modules/error";
import lib_cache from "@/modules/cache";
import lib_storage from "@/modules/storage";

import { Z_JWTAuthPayload, Z_RefreshTokenPayload } from "@/modules/parser";
import type { T_JWTAuthPayload, T_RefreshTokenPayload } from "@/modules/parser";

import query_platform from "@/gql/resolvers/query/platform";

export default class mutation_user {
  public static async register(args: any, context: any) {
    const { captchaToken, email, displayName, password, setupKey } = args;

    if (!captchaToken) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captchaToken is missing"
      );
    }

    const captchaValid = await lib_captcha.verify(
      captchaToken,
      context.request.headers["CF-Connecting-IP"] || null
    );

    if (!captchaValid) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captcha is not valid"
      );
    }

    if (!email || !displayName || !password) {
      throw lib_error.bad_request(
        "Missing required fields",
        "missing email/displayName/password"
      );
    }

    let sanitizedEmail;

    try {
      sanitizedEmail = lib_vet.email(email);
    } catch (error) {
      throw lib_error.bad_request(
        "Invalid email address",
        `email vet failed: ${error}`
      );

      // throw new GraphQLError("Invalid email address", {
      //   extensions: {
      //     code: "BAD_REQUEST",
      //     http: { status: 400 },
      //   },
      // });
    }

    const displayNameVetResult = lib_vet.displayName(displayName);

    if (!displayNameVetResult.valid) {
      throw lib_error.bad_request(displayNameVetResult.errors.join(". "));
    }

    const passwordVetResult = lib_vet.password(password);

    if (!passwordVetResult.valid) {
      throw lib_error.bad_request(passwordVetResult.errors.join(". "));
    }

    let platformRole: PlatformRole = "USER";

    let platformSetupCompleted: boolean | undefined;

    // // const cacheResult = await lib_cache.get("platform_is_setup_completed");

    // if (cacheResult.data && cacheResult.data.platformSetupCompleted === true) {
    //   // Will never save to cache if it's not setup
    //   platformSetupCompleted = true;
    // } else {
    //   const platformInfo = await query_platform.getInfo();

    //   platformSetupCompleted = platformInfo.isSetupCompleted;

    //   if (platformSetupCompleted === true) {
    //     await lib_cache.set(
    //       "platform_setup_completed",
    //       {
    //         platformSetupCompleted,
    //       },
    //       60 * 60 * 24
    //     );
    //   }
    // }

    const platformInfo = await query_platform.getInfo();

    platformSetupCompleted = platformInfo.isSetupCompleted;

    if (!platformSetupCompleted) {
      if (!setupKey) {
        throw lib_error.bad_request("Platform must be setup first");
      }

      if (setupKey !== process.env.SETUP_KEY) {
        throw lib_error.bad_request(
          "Unauthorized",
          `setupKey is not valid, received: ${setupKey}`
        );
      }

      platformRole = "SUPER_ADMIN";
    } else {
      if (setupKey) {
        throw lib_error.bad_request(
          "Unauthorized",
          "platform is already setup lol, super admin registration is closed"
        );
      }
    }

    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "argon2id",
    });

    return await prisma
      .$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: sanitizedEmail,
            displayName,
            password: hashedPassword,
            platformRole,
          },
        });

        if (!platformSetupCompleted) {
          await tx.platform.update({
            where: {
              key: "isSetupCompleted",
            },
            data: {
              value: "true",
            },
          });
        }

        return user;
      })
      .then(async (user) => {
        return await lib_token.genAuthTokenWithRefresh(
          user.userId,
          user.passwordSession,
          user.accountSession
        );
      })
      .catch((error: any) => {
        switch (error.code) {
          case "P2002":
            throw lib_error.bad_request(
              "Email is already registered",
              `unique constraint error: ${error}`
            );
          // throw new GraphQLError("Email already registered", {
          //   extensions: {
          //     code: "BAD_REQUEST",
          //     http: { status: 400 },
          //   },
          // });
          default:
            const refId = Bun.randomUUIDv7();

            console.error(
              `${lib_logger.formatPrefix("mutation_user/register")} [${refId}] Failed to create user`,
              error
            );

            throw lib_error.internal_server_error(
              `Internal Server Error. refId: ${refId}`,
              `500 failed to create user: ${error}`
            );
        }
      });

    // throw new GraphQLError("Not implemented", {
    //   extensions: {
    //     code: "NOT_IMPLEMENTED",
    //     http: { status: 501 },
    //   },
    // });
  }

  public static async login(args: any, context: any) {
    const { captchaToken, email, password } = args;

    if (!captchaToken) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captchaToken is missing"
      );
    }

    const captchaValid = await lib_captcha.verify(
      captchaToken,
      context.request.headers["CF-Connecting-IP"] || null
    );

    if (!captchaValid) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captchaToken is not valid"
      );
    }

    if (!email || !password) {
      throw lib_error.bad_request(
        "Missing required fields",
        "missing email/password"
      );
    }

    let sanitizedEmail;

    try {
      sanitizedEmail = lib_vet.email(email);
    } catch (error) {
      throw lib_error.unauthorized(
        "Unauthorized",
        `email vet failed: ${error}`
      );
    }

    const passwordVetResult = lib_vet.password(password);

    if (!passwordVetResult.valid) {
      throw lib_error.unauthorized("Unauthorized", `password vet failed`);
    }

    let user: User | null = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("mutation_user/login")} [${refId}] Failed to fetch user`,
        error
      );

      throw lib_error.unauthorized(
        "Unauthorized",
        `refId: ${refId}. unexpected error: ${error}`
      );
    }

    if (!user) {
      throw lib_error.unauthorized("Unauthorized", `email not found`);
    }

    const passwordMatch = await Bun.password.verify(
      password,
      user.password,
      "argon2id"
    );

    if (!passwordMatch) {
      throw lib_error.unauthorized("Unauthorized", `password incorrect`);
    }

    return lib_token
      .genAuthTokenWithRefresh(
        user.userId,
        user.passwordSession,
        user.accountSession
      )
      .then((data) => {
        return data;
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_user/login")} [${refId}] Failed to generate token`,
          error
        );

        throw lib_error.internal_server_error(
          `Internal Server Error. refId: ${refId}`,
          `500 failed to generate token: ${error}`
        );
      });
  }

  public static async refreshToken(args: any) {
    const { token, refreshToken } = args;

    if (!token || !refreshToken) {
      throw lib_error.bad_request(
        "Missing required fields",
        "missing token/refreshToken"
      );
    }

    const result = await lib_token.validateAuthToken(
      "This function doesn't do suspended token check",
      token
    );

    if (
      // (!result.valid || !result.payload) &&
      !result.valid &&
      !result.renew
      // !result.renew &&
      // process.env.NODE_ENV !== "development"
    ) {
      throw lib_error.unauthorized("Unauthorized", "token is not valid");
    }

    if (!result.renew && process.env.NODE_ENV === "development") {
      console.warn(
        `${lib_logger.formatPrefix("mutation_user/refreshToken")} Token not ready for renew but bypassed for dev mode`
      );
    }

    const extractedRefreshToken = lib_token.extractRefreshToken(refreshToken);

    if (!extractedRefreshToken.success) {
      throw lib_error.unauthorized(
        "Unauthorized",
        `refresh token extraction failed: ${JSON.stringify(extractedRefreshToken.error)}`
      );
    }

    const { userId, sessionId, sessionKey } =
      extractedRefreshToken.data as T_RefreshTokenPayload;

    let user:
      | (User & {
          sessions: Session[];
          suspendedTokens: SuspendedToken[];
        })
      | null = null;

    try {
      user = await prisma.user.findUnique({
        where: {
          userId,
        },
        include: {
          sessions: true,
          suspendedTokens: true,
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("mutation_user/refreshToken")} [${refId}] Failed to fetch user`,
        error
      );

      throw lib_error.unauthorized(
        "Unauthorized",
        `refId: ${refId}. unexpected error: ${error}`
      );
    }

    if (!user) {
      throw lib_error.unauthorized("Unauthorized", "user not found lol");
    }

    console.log("SKIBIDI AMOGUS SUS PAYLOAD ERROR", result.payload);

    if (!lib_token.checkAuthToken(user, result.payload as T_JWTAuthPayload)) {
      throw lib_error.unauthorized(
        "Unauthorized",
        `token db check failed, either suspended or invalidated account/password session`
      );
    }

    const refreshTokenValidationResult = await lib_token.validateRefreshToken(
      user,
      userId,
      sessionId,
      sessionKey
    );

    if (!refreshTokenValidationResult.valid) {
      throw lib_error.unauthorized(
        "Unauthorized",
        `refresh token validation error. code: ${refreshTokenValidationResult.code}`
      );
    }

    return await lib_token
      .genAuthToken(userId, user.passwordSession, user.accountSession)
      .then((data) => {
        return {
          token: data,
        };
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_user/login")} [${refId}] Failed to generate token`,
          error
        );

        throw lib_error.internal_server_error(
          `Internal Server Error. refId: ${refId}`,
          `500 failed to generate token: ${error}`
        );
      });

    // throw lib_error.unauthorized("Unauthorized", `gurt: yo`);
  }
}
