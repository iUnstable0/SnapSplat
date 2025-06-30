import { GraphQLError } from "graphql";

export default class query_user {
  public static async getAuthenticatedInfo(args: any, context: any) {
    return {
      email: context.user.email,
      displayName: context.user.displayName,
      profilePicture: context.user.profilePicture,
    };
  }
}
