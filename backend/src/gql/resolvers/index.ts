import query_user from "./query/user.ts";

type argsType = [parent: any, args: any, contextValue: any];

export default {
  Query: {
    hello: () => "Hi!",
    user: (...args: argsType) =>
      query_user.getAuthenticatedInfo(args[1], args[2]),
  },
  Mutation: {
    register: (...args: argsType) => query_user.register(args[1], args[2]),
  },
};
