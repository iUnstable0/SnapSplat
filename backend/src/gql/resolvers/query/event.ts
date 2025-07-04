import prisma from "@/db/prisma";
import type { Event, EventMembership } from "@/generated/prisma";

import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";

import { Z_EventMembership } from "@/db/types";
import type { T_EventMembership } from "@/db/types";

export default class query_event {
  public static async getInfo(args: any, context: any) {
    const eventId = args.eventId;

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    let event: Event | null = null;

    try {
      event = await prisma.event.findUnique({
        where: { eventId },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getInfo")} [${refId}] Failed to fetch event`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event info: ${error}`
      );
    }

    if (!event) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    // console.log(event);

    return event;
  }

  public static async getHostMember(args: any) {
    const [parent, body, context] = args;

    if (parent) {
      // console.log(`parent: ${JSON.stringify(parent)}`);
      return parent.hostMember;
    }

    const eventId = body.eventId;

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    let event: (Event & { hostMember: EventMembership | null }) | null = null;

    try {
      event = await prisma.event.findUnique({
        where: { eventId },
        include: {
          hostMember: true,
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getHost")} [${refId}] Failed to fetch event`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event host: ${error}`
      );
    }

    if (!event) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    return event.hostMember;
  }

  public static async getMemberships(args: any) {
    const eventId = args.eventId;

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    let memberships: EventMembership[] = [];

    try {
      memberships = await prisma.eventMembership.findMany({
        where: { eventId },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getMemberships")} [${refId}] Failed to fetch memberships`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event memberships: ${error}`
      );
    }

    return memberships;
  }

  public static async getMyMembership(args: any) {
    const [parent, body, context] = args;

    let eventId = null;

    if (parent) {
      eventId = parent.eventId;
    } else {
      eventId = body.eventId;
    }

    if (!eventId) {
      throw lib_error.bad_request(
        "Missing required fields",
        "Missing eventId for myMembership"
      );
    }

    let membership: EventMembership | null = null;

    try {
      membership = await prisma.eventMembership.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: context.user.userId,
          },
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getMyMembership")} [${refId}] Failed to fetch my membership`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch my event membership: ${error}`
      );
    }

    if (!membership) {
      throw lib_error.not_found(
        "Membership not found",
        `Membership for event ${eventId} with user id ${context.user.userId} not found`
      );
    }

    const parsedMembership = Z_EventMembership.parse(membership);

    return {
      ...parsedMembership,
      avatarAlt: parsedMembership.avatarAlt.replace(
        "USER_DISPLAY_NAME",
        encodeURIComponent(parsedMembership.displayNameAlt)
      ),
    };
  }
}
