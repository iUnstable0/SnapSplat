import validator from "validator";

import { Z_DisplayName, Z_Password, Z_Email } from "@/types";

export default class lib_vet {
  public static email(input: string) {
    const result = Z_Email.safeParse(input);

    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(". "),
      );
    }

    return result.data;

    // const sanitizedEmail = validator.normalizeEmail(email.trim());
    //
    // if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
    //   throw new Error("Invalid email");
    // }
    //
    // return sanitizedEmail;
  }

  public static displayName(input: string) {
    const result = Z_DisplayName.safeParse(input);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((issue) => issue.message),
      };
    }

    return {
      valid: true,
      errors: [],
    };
  }

  public static password(input: string) {
    // const result: boolean | any[] = passwordSchema.validate(input, {
    //   details: true,
    // });

    const result = Z_Password.safeParse(input);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((issue) => issue.message),
      };
    }

    return {
      valid: true,
      errors: [],
    };

    //
    // return {
    //   valid: true,
    //   errors: [],
    // };

    // if (typeof result === "boolean") {
    //   return {
    //     valid: false,
    //     errors: [
    //       "Unknown error occurred during password validation. Please try again.",
    //     ],
    //   };
    // }

    // if (result.length === 0) {
    //   return {
    //     valid: true,
    //     errors: [],
    //   };
    // }

    // const errors = result.map((error) =>
    //   error.message.replaceAll("The string", "Password"),
    // );
    //
    // return {
    //   valid: false,
    //   errors: errors,
    // };
  }
}
