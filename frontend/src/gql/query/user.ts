import schemas from "@/gql/schemas";
import requester from "@/gql/requester";

export default class query_user {
  public static async getAuthenticatedInfo() {
    return requester.request({
      data: {
        query: schemas.query.user.getAuthenticatedInfo,
      },
      withAuth: true,
    });
  }
}
