import prisma from "@/db/prisma";
import type { User, EventMembership, Event } from "@/generated/prisma";

import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";
import lib_role from "@/modules/role";

import { Z_EventMembership, Z_User } from "@/db/types";

export default class query_user {
  public static async getAuthenticatedInfo(args: any) {
    const [parent, body, context] = args;

    // parse only for the avatar

    const userData = Z_User.parse(context.user);

    console.log(userData);

    return userData;

    // return {
    //   ...userData,

    //   avatar: userData.avatar.replace(
    //     "USER_DISPLAY_NAME",
    //     encodeURIComponent(userData.displayName)
    //   ),
    // };
  }

  // console.log("PARSED IS ", userData);
  public static async getEvents(args: any) {
    const [parent, body, context] = args;

    let memberships: (EventMembership & { event: Event })[] | null = null;

    try {
      // data = await prisma.user.findUnique({
      //   where: { userId: context.user.userId },
      //   include: {
      //     memberships: {
      //       include: {
      //         event: {
      //           include: {
      //             hostMember: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      memberships = await prisma.eventMembership.findMany({
        where: {
          userId: context.user.userId,
          isApproved: true,
          eventRole: {
            not: "HOST",
          },
          event: {
            isArchived: false,
          },
        },
        include: {
          event: {
            include: {
              hostMember: true,
            },
          },
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_user/getEvents")} [${refId}] Failed to fetch events`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch user events: ${error}`
      );
    }

    if (!memberships) {
      throw lib_error.not_found(
        "User not found",
        `User with id ${context.user.userId} not found`
      );
    }

    const parsedMemberships = Z_EventMembership.array().parse(memberships);

    const events = parsedMemberships.map((membership) => membership.event);

    // const events = data.memberships
    //   .filter((membership) => !lib_role.event_isHost(membership))
    //   .map((membership) => membership.event);

    // console.log(`data.hostedEvents: ${JSON.stringify(data.hostedEvents)}`);

    // console.log(`events: ${events.length}`);

    // return [...data.hostedEvents, ...events];

    return events;
  }

  public static async getMyEvents(args: any) {
    const [parent, body, context] = args;

    let user:
      | (User & {
          hostedEvents: Event[];
        })
      | null = null;

    try {
      user = await prisma.user.findUnique({
        where: { userId: context.user.userId },
        include: {
          hostedEvents: {
            include: {
              hostMember: true,
            },
          },
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_user/getMyEvents")} [${refId}] Failed to fetch my events`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch my events: ${error}`
      );
    }

    if (!user) {
      throw lib_error.not_found(
        "User not found",
        `User with id ${context.user.userId} not found`
      );
    }

    const parsedUser = Z_User.parse(user);

    return parsedUser.hostedEvents;
  }
}
