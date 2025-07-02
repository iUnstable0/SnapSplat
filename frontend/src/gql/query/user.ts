// import * as z from "zod/v4";

// // import schemas from "@/gql/schemas";
// import requester from "@/gql/requester";

// import { Z_User } from "@/gql/types";

// const Z_UserResponse = z.object({
//   user: Z_User,
// });

// type T_UserResponse = z.infer<typeof Z_UserResponse>;

// export default class query_user {
//   public static async getAuthenticatedInfo(): Promise<T_UserResponse> {
//     return requester.request({
//       data: {
//         query: schemas.query.user.getAuthenticatedInfo,
//       },
//       withAuth: true,
//     });
//   }
// }
