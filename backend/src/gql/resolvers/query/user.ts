import { GraphQLError } from "graphql";

export default class query_user {
  public static async getAuthenticatedInfo(args: any, contextValue: any) {
    throw new GraphQLError("Not implemented", {
      extensions: {
        code: "NOT_IMPLEMENTED",
        http: { status: 501 },
      },
    });
  }
}
