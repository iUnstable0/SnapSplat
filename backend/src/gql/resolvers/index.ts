import query_user from "./query/user";
import mutation_user from "./mutation/user";

type argsType = [parent: any, args: any, context: any];

export default {
  Query: {
    hello: () => "Hi!",
    user: (...args: argsType) =>
      query_user.getAuthenticatedInfo(args[1], args[2]),
  },
  Mutation: {
    register: (...args: argsType) => mutation_user.register(args[1], args[2]),
    login: (...args: argsType) => mutation_user.login(args[1], args[2]),
    refreshToken: (...args: argsType) => mutation_user.refreshToken(args[1])
  },
};
