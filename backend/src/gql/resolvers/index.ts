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
    me: (...args: argsType) => {
      console.log("me query");

      return query_user.getAuthenticatedInfo(args);
    },
    platform: (...args: argsType) => query_platform.getInfo(),
    event: (...args: argsType) => {
      console.log("event query");

      return query_event.getInfo(args[1], args[2]);
    },
  },
  Mutation: {
    register: (...args: argsType) => mutation_user.register(args[1], args[2]),
    login: (...args: argsType) => mutation_user.login(args[1], args[2]),
    refreshToken: (...args: argsType) => mutation_user.refreshToken(args[1]),
    joinEvent: (...args: argsType) => mutation_event.joinEvent(args),
    leaveEvent: (...args: argsType) => mutation_event.leaveEvent(args),
    createEvent: (...args: argsType) => mutation_event.createEvent(args),
    updateEvent: (...args: argsType) => mutation_event.updateEvent(args),
    deleteEvent: (...args: argsType) => mutation_event.deleteEvent(args),
    uploadPhoto: (...args: argsType) => mutation_event.uploadPhoto(args),
  },
  User: {
    events: (...args: argsType) => {
      console.log("user resolver events query");

      return query_user.getEvents(args);
    },
    myEvents: (...args: argsType) => {
      console.log("user resolver hostedEvents query");

      return query_user.getMyEvents(args);
    },
  },
  Event: {
    hostMember: (...args: argsType) => {
      console.log("event resolver hostMember query");

      // console.log(args[0]);

      return query_event.getHostMember(args);
    },
    memberships: (...args: argsType) => {
      console.log("event resolver memberships query");

      return query_event.getMemberships(args);
    },
    myMembership: (...args: argsType) => {
      console.log("event resolver myMembership query");

      return query_event.getMyMembership(args);
    },
    invites: (...args: argsType) => {
      console.log("event resolver invites query");

      return query_event.getInvites(args);
    },
    photos: (...args: argsType) => {
      console.log("event resolver photos query");

      return query_event.getPhotos(args);
    },
  },
};
