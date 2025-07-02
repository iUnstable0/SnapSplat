import {
  DateTimeISOResolver,
  EmailAddressResolver,
  JWTResolver,
  URLResolver,
  UUIDResolver,
} from "graphql-scalars";

import query_user from "./query/user";
import mutation_user from "./mutation/user";
import query_platform from "./query/platform";

type argsType = [parent: any, args: any, context: any];

export default {
  DateTimeISO: DateTimeISOResolver,
  EmailAddress: EmailAddressResolver,
  JWT: JWTResolver,
  URL: URLResolver,
  UUID: UUIDResolver,

  Query: {
    hello: () => "Hi!",
    user: (...args: argsType) =>
      query_user.getAuthenticatedInfo(args[1], args[2]),
    platform: (...args: argsType) => query_platform.getInfo(),
  },
  Mutation: {
    register: (...args: argsType) => mutation_user.register(args[1], args[2]),
    login: (...args: argsType) => mutation_user.login(args[1], args[2]),
    refreshToken: (...args: argsType) => mutation_user.refreshToken(args[1]),
  },
  User: {
    events: (...args: argsType) => query_user.getEvents(args[1], args[2]),
  },
};
