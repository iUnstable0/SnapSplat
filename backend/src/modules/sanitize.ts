import validator from "validator";

export default class lib_sanitize {
  public static email(email: string) {
    const sanitizedEmail = validator.normalizeEmail(email.trim());

    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error("Invalid email");
    }

    return sanitizedEmail;
  }
}
