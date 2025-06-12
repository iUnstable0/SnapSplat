export default class lib_logger {
  private static calculatePadding(prefix: string): string {
    const maxLength = 10;
    const paddingLength = Math.max(0, maxLength - prefix.length + 2); // +2 for the brackets

    return " ".repeat(paddingLength);
  }

  public static formatPrefix(prefix: string): string {
    return `[${prefix}]${lib_logger.calculatePadding(prefix)}`;
  }
}
