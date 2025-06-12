import Bun from "bun";
import validator from "validator";
import { GraphQLError } from "graphql";

import db_user from "@/db/user";

import lib_captcha from "@/modules/captcha";
import lib_vet from "@/modules/vet";

export default class mutation_user {
  public static async register(args: any, context: any) {
    const { captchaToken, email, name, password } = args;

    if (!captchaToken) {
      throw new GraphQLError("Captcha verification failed", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    const captchaValid = await lib_captcha.verify(
      captchaToken,
      context.request.headers["CF-Connecting-IP"] || null
    );

    if (!captchaValid) {
      throw new GraphQLError("Captcha verification failed", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    if (!email || !name || !password) {
      throw new GraphQLError("Missing required fields", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    let sanitizedEmail;

    try {
      sanitizedEmail = lib_vet.email(email);
    } catch (error) {
      throw new GraphQLError("Invalid email", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    const nameVetResult = lib_vet.name(name);

    if (!nameVetResult.valid) {
      throw new GraphQLError(nameVetResult.errors.join(". "), {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    const passwordVetResult = lib_vet.password(password);

    if (!passwordVetResult.valid) {
      throw new GraphQLError(passwordVetResult.errors.join(". "), {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    if (await db_user.getUserByEmail(sanitizedEmail)) {
      throw new GraphQLError("Email already registered", {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 }
        }
      });
    }

    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "argon2id"
    });

    db_user.create({
      email: sanitizedEmail,
      name:
    });

    // throw new GraphQLError("Not implemented", {
    //   extensions: {
    //     code: "NOT_IMPLEMENTED",
    //     http: { status: 501 },
    //   },
    // });

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
