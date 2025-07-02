// import schemas from "@/gql/schemas";
// import requester from "@/gql/requester";

// export default class mutation_user {
//   public static login(captchaToken: string, email: string, password: string) {
//     return requester.request({
//       data: {
//         query: schemas.mutation.user.login,
//         variables: {
//           captchaToken,
//           email,
//           password,
//         },
//       },
//     });
//   }

//   public static register(
//     captchaToken: string,
//     email: string,
//     password: string,
//     displayName: string,
//     setupKey?: string
//   ) {
//     return requester.request({
//       data: {
//         query: schemas.mutation.user.register,
//         variables: {
//           captchaToken,
//           email,
//           password,
//           displayName,
//           setupKey,
//         },
//       },
//     });
//   }

//   public static refreshToken(token: string, refreshToken: string) {
//     return requester.request({
//       data: {
//         query: schemas.mutation.user.refreshToken,
//         variables: {
//           token,
//           refreshToken,
//         },
//       },
//     });
//   }
// }
