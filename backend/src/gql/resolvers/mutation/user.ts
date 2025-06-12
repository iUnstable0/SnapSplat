import { GraphQLError } from "graphql";
import validator from "validator";

import db_user from "@/db/user";

import lib_captcha from "@/modules/captcha";

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

    if (!validator.isEmail(email)) {
      throw new GraphQLError("Invalid email format", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }

    if (await db_user.getUserByEmail(email)) {
      throw new GraphQLError("Email already registered", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      });
    }
  }
}
