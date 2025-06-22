import { GraphQLError } from "graphql";

export default class query_user {
  public static async getAuthenticatedInfo(args: any, context: any) {
    // throw new GraphQLError("Not implemented", {
    //   extensions: {
    //     code: "NOT_IMPLEMENTED",
    //     http: { status: 501 },
    //   },
    // });

    return {
      id: 12,
      email: "test@test.com",
      displayName: "Test User",
      profilePicture: "https://example.com/profile.jpg",
    };
  }
}
