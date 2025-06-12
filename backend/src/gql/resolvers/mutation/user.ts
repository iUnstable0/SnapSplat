import { GraphQLError } from "graphql";
import validator from "validator";

import db_user from "@/db/user";

import lib_captcha from "@/modules/captcha";
import lib_sanitize from "@/modules/sanitize.ts";

export default class mutation_user {
  public static async register(args: any, contextValue: any) {
    const { captchaToken, email, name, password } = args;

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
      contextValue.req.headers["CF-Connecting-IP"],
    );

    if (!captchaValid) {
      throw new GraphQLError("Captcha verification failed", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }

    if (!email || !name || !password) {
      throw new GraphQLError("Missing required fields", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }

    const sanitizedEmail = lib_sanitize.email(email);

    console.log(db_user.getUserByEmail(sanitizedEmail));

    throw new GraphQLError("Not implemented", {
      extensions: {
        code: "NOT_IMPLEMENTED",
        http: { status: 501 },
      },
    });

    // if (await db_user.getUserByEmail(sanitizedEmail)) {
    //   throw new GraphQLError("Email already registered", {
    //     extensions: {
    //       code: "BAD_REQUEST",
    //       http: { status: 400 },
    //     },
    //   });
    // }
  }
}
