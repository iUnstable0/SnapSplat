import validator from "validator";
import passwordValidator from "password-validator";

export default class lib_vet {
  private static nameSchema = new passwordValidator()
    .is()
    .min(1)
    .is()
    .max(30)
    .has()
    .not()
    .symbols();

  private static passwordSchema = new passwordValidator()
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits(1)
    .has()
    .symbols(1)
    .has()
    .not()
    .spaces();

  public static email(email: string) {
    const sanitizedEmail = validator.normalizeEmail(email.trim());

    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error("Invalid email");
    }

    return sanitizedEmail;
  }

  public static name(name: string) {
    const sanitizedName = name
      .split(" ")
      .filter((part) => part !== "")
      .join(" ");

    if (sanitizedName.length !== name.length) {
      return {
        valid: false,
        errors: [
          "Name cannot contain leading, trailing, or consecutive spaces",
        ],
      };
    }

    const result: boolean | any[] = lib_vet.nameSchema.validate(name, {
      details: true,
    });

    if (typeof result === "boolean") {
      return {
        valid: false,
        errors: [
          "Unknown error occurred during name validation. Please try again.",
        ],
      };
    }

    if (result.length === 0) {
      return {
        valid: true,
        errors: [],
      };
    }

    const errors = result.map((error) =>
      error.message.replaceAll("The string", "Name"),
    );

    return {
      valid: false,
      errors: errors,
    };
  }

  public static password(password: string) {
    const result: boolean | any[] = lib_vet.passwordSchema.validate(password, {
      details: true,
    });

    if (typeof result === "boolean") {
      return {
        valid: false,
        errors: [
          "Unknown error occurred during password validation. Please try again.",
        ],
      };
    }

    if (result.length === 0) {
      return {
        valid: true,
        errors: [],
      };
    }

    const errors = result.map((error) =>
      error.message.replaceAll("The string", "Password"),
    );

    return {
      valid: false,
      errors: errors,
    };
  }
}
