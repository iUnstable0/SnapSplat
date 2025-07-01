import { Z_User } from "@/db/types";

export default class query_user {
  public static async getAuthenticatedInfo(args: any, context: any) {
    const userData = Z_User.parse(context.user);

    // console.log("PARSED IS ", userData);

    return {
      ...userData,

      avatar: userData.avatar.replace(
        "USER_DISPLAY_NAME",
        encodeURIComponent(userData.displayName)
      ),
    };
  }
}
