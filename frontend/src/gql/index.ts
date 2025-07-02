// import query_user from "./query/user";
// import mutation_user from "./mutation/user";

// import query_platform from "./query/platform";

// export default {
//   query: {
//     user: () => query_user.getAuthenticatedInfo(),
//     platform: () => query_platform.getInfo(),
//   },
//   mutation: {
//     login: (captchaToken: string, email: string, password: string) =>
//       mutation_user.login(captchaToken, email, password),
//     register: (
//       captchaToken: string,
//       email: string,
//       password: string,
//       displayName: string,
//       setupKey?: string
//     ) =>
//       mutation_user.register(
//         captchaToken,
//         email,
//         password,
//         displayName,
//         setupKey
//       ),
//     refreshToken: (token: string, refreshToken: string) =>
//       mutation_user.refreshToken(token, refreshToken),
//   },
// };
