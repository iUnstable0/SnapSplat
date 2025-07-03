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

import query_event from "./query/event";
import mutation_event from "./mutation/event";

type argsType = [parent: any, args: any, context: any];

export default {
  DateTimeISO: DateTimeISOResolver,
  EmailAddress: EmailAddressResolver,
  JWT: JWTResolver,
  URL: URLResolver,
  UUID: UUIDResolver,

  Query: {
    hello: () => "Hi!",
    me: (...args: argsType) =>
      query_user.getAuthenticatedInfo(args[1], args[2]),
    platform: (...args: argsType) => query_platform.getInfo(),
    event: (...args: argsType) => query_event.getInfo(args[1], args[2]),
  },
  Mutation: {
    register: (...args: argsType) => mutation_user.register(args[1], args[2]),
    login: (...args: argsType) => mutation_user.login(args[1], args[2]),
    refreshToken: (...args: argsType) => mutation_user.refreshToken(args[1]),
    createEvent: (...args: argsType) =>
      mutation_event.createEvent(args[1], args[2]),
  },
  Event: {
    host: (...args: argsType) => query_event.getHost(args[1]),
    memberships: (...args: argsType) => query_event.getMemberships(args[1]),
    myMembership: (...args: argsType) =>
      query_event.getMyMembership(args[1], args[2]),
  },
};
