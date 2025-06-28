import query_user from "./query/user";
import mutation_user from "./mutation/user";

export default {
  query: {
    user: () => query_user.getAuthenticatedInfo(),
  },
  mutation: {
    login: (captchaToken: string, email: string, password: string) =>
      mutation_user.login(captchaToken, email, password),
    register: (captchaToken: string, email: string, password: string, displayName: string) =>
      mutation_user.register(captchaToken, email, password, displayName),
    refreshToken: (token: string, refreshToken: string) =>
      mutation_user.refreshToken(token, refreshToken)
  },
};
