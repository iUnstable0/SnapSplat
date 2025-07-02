// import * as z from "zod/v4";

// import schemas from "@/gql/schemas";
// import requester from "@/gql/requester";

// import { Z_Platform } from "@/gql/types";

// const Z_PlatformResponse = z.object({
//   platform: Z_Platform,
// });

// type T_PlatformResponse = z.infer<typeof Z_PlatformResponse>;

// export default class query_platform {
//   public static async getInfo(): Promise<T_PlatformResponse> {
//     return requester.request({
//       data: { query: schemas.query.platform.getInfo },
//     });
//   }
// }
