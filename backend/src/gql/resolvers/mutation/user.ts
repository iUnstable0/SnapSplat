import Bun from "bun";
import validator from "validator";
import { GraphQLError } from "graphql";

import prisma from "@/db/prisma";

// import db_user from "@/db/user";

import lib_logger from "@/modules/logger";
import lib_captcha from "@/modules/captcha";
import lib_vet from "@/modules/vet";
import lib_token from "@/modules/token";

export default class mutation_user {
  public static async register(args: any, context: any) {
    const { captchaToken, email, displayName, password } = args;

    if (!captchaToken) {
      throw new GraphQLError("Captcha verification failed", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }

    const captchaValid = await lib_captcha.verify(
      captchaToken,
      context.request.headers["CF-Connecting-IP"] || nul,
    );

    if (!captchaValid) {
      throw new GraphQLError("Captcha verification failed", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }

    if (!email || !displayName || !password) {
      throw new GraphQLError("Missing required fields", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }

    let sanitizedEmail;

    try {
      sanitizedEmail = lib_vet.email(email);
    } catch (error) {
      throw new GraphQLError("Invalid email", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 ,
        },
      });
    }

    const displayNameVetResult = lib_vet.displayName(displayName);

    if (!displayNameVetResult.valid) {
      throw new GraphQLError(displayNameVetResult.errors.join(". "), {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        },
      });
    }

    const passwordVetResult = lib_vet.password(password);

    if (!passwordVetResult.valid) {
      throw new GraphQLError(passwordVetResult.errors.join(". "), {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        },
      });
    }

    if (
      await prisma.user.findUnique({
        where: { email: sanitizedEmail }
      })
    ) {
      throw new GraphQLError("Email already registered", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        },
      });
    }

    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "argon2id"
    });

    return prisma.user
      .create({
        data: {
          email: sanitizedEmail,
          displayName,
          password: hashedPassword
        }
      })
      .then(async (user) => {
        const authToken = await lib_token.genAuthToken(user.userId);

        return {
          token: authToken
        };
      })
      .catch((error) => {
        console.error(
          `${lib_logger.formatPrefix("mutation_user")} Failed to create user`,
          error
        );

        throw new GraphQLError("Internal Server Error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            http: { status: 500 }
          }
        });
      });

    // throw new GraphQLError("Not implemented", {
    //   extensions: {
    //     code: "NOT_IMPLEMENTED",
    //     http: { status: 501 },
    //   },
    // });
  }
}
