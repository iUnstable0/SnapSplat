import * as z from "zod/v4";

import prisma from "@/db/prisma";

import { EventRole } from "@/generated/prisma";

import type {
  Event,
  EventInvite,
  EventMembership,
  EventPhoto,
} from "@/generated/prisma";

import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";
import lib_role from "@/modules/role";

import { Z_Event, Z_EventMembership } from "@/db/types";
import lib_storage from "@/modules/storage";

export default class query_event {
  // Guarded by @auth(requires: USER)
  // User needs to be a member of the event to view the event info

  public static async getInfo(args: any, context: any) {
    const eventId = args.eventId;

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    // let event: Event | null = null;

    // try {
    //   event = await prisma.event.findUnique({
    //     where: { eventId },
    //   });
    // } catch (error) {
    //   const refId = Bun.randomUUIDv7();

    //   console.error(
    //     `${lib_logger.formatPrefix("query_event/getInfo")} [${refId}] Failed to fetch event`,
    //     error
    //   );

    //   throw lib_error.internal_server_error(
    //     "Internal Server Error. refId: ${refId}",
    //     `500 failed to fetch event info: ${error}`
    //   );
    // }

    let membership: (EventMembership & { event: Event }) | null = null;

    try {
      membership = await prisma.eventMembership.findUnique({
        where: { eventId_userId: { eventId, userId: context.user.userId } },
        include: {
          event: true,
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getInfo")} [${refId}] Failed to fetch event membership`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event membership: ${error}`
      );
    }

    if (!membership) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    const parsedEvent = Z_Event.parse(membership.event);

    return parsedEvent;
  }

  // Guarded by @auth(requires: USER)
  // User needs to be a member of the event to view the host member

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

    let membership:
      | (EventMembership & {
          event: Event & { hostMember: EventMembership | null };
        })
      | null = null;

    try {
      membership = await prisma.eventMembership.findUnique({
        where: { eventId_userId: { eventId, userId: context.user.userId } },
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
        `${lib_logger.formatPrefix("query_event/getHostMember")} [${refId}] Failed to fetch event membership`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event membership: ${error}`
      );
    }

    if (!membership) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    const parsedHostMember = Z_EventMembership.parse(
      membership.event.hostMember
    );

    return parsedHostMember;
  }

  // Guarded by @auth(requires: USER)
  // User needs to be a member of the event to view the memberships

  public static async getMemberships(args: any) {
    const [parent, body, context] = args;

    let eventId = null;

    if (parent) {
      eventId = parent.eventId;
    } else {
      eventId = body.eventId;
    }

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    let membership:
      | (EventMembership & {
          event: Event & { memberships: EventMembership[] };
        })
      | null = null;

    try {
      membership = await prisma.eventMembership.findUnique({
        where: { eventId_userId: { eventId, userId: context.user.userId } },
        include: {
          event: {
            include: {
              memberships: true,
            },
          },
        },
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

    if (!membership) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    const parsedMemberships = Z_EventMembership.array().parse(
      membership.event.memberships
    );

    return parsedMemberships;

    // try {
    //   memberships = await prisma.eventMembership.findMany({
    //     where: { eventId },
    //   });
    // } catch (error) {
    //   const refId = Bun.randomUUIDv7();

    //   console.error(
    //     `${lib_logger.formatPrefix("query_event/getMemberships")} [${refId}] Failed to fetch memberships`,
    //     error
    //   );

    //   throw lib_error.internal_server_error(
    //     "Internal Server Error. refId: ${refId}",
    //     `500 failed to fetch event memberships: ${error}`
    //   );
    // }

    // return memberships;
  }

  // Guarded by @auth(requires: USER)
  // User needs to be a member of the event to view their membership
  // This fetches data based on authenticated userId

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

    console.log(parsedMembership);

    return parsedMembership;

    // return {
    //   ...parsedMembership,
    //   avatarAlt: parsedMembership.avatarAlt.replace(
    //     "USER_DISPLAY_NAME",
    //     encodeURIComponent(parsedMembership.displayNameAlt)
    //   ),
    // };
  }

  // Guarded by @auth(requires: USER)
  // User needs to be a member of the event AND has COHOST role to view the invites

  public static async getInvites(args: any) {
    const [parent, body, context] = args;

    let eventId = null;

    if (parent) {
      eventId = parent.eventId;
    } else {
      eventId = body.eventId;
    }

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    let membership:
      | (EventMembership & {
          event: Event & { invites: EventInvite[] };
        })
      | null = null;

    try {
      membership = await prisma.eventMembership.findUnique({
        where: { eventId_userId: { eventId, userId: context.user.userId } },
        include: {
          event: {
            include: {
              invites: true,
            },
          },
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getInvites")} [${refId}] Failed to fetch event membership`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event membership: ${error}`
      );
    }

    if (!membership) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    if (!lib_role.event_hasRole(membership.eventRole, EventRole.COHOST)) {
      throw lib_error.forbidden(
        "Forbidden",
        "User does not have COHOST role in the event"
      );
    }

    return membership.event.invites;
  }

  public static async getPhotos(args: any) {
    const [parent, body, context] = args;

    let eventId = null;

    if (parent) {
      eventId = parent.eventId;
    } else {
      eventId = body.eventId;
    }

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "Missing eventId");
    }

    let membership:
      | (EventMembership & {
          event: Event & { photos: EventPhoto[] };
        })
      | null = null;

    try {
      membership = await prisma.eventMembership.findUnique({
        where: { eventId_userId: { eventId, userId: context.user.userId } },
        include: {
          event: {
            include: {
              photos: true,
            },
          },
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_event/getPhotos")} [${refId}] Failed to fetch event membership`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to fetch event membership: ${error}`
      );
    }

    if (!membership) {
      throw lib_error.not_found(
        "Event not found",
        `Event with id ${eventId} not found`
      );
    }

    const photos = membership.event.photos;

    // Generate presigned URLs efficiently
    const signedUrls = await lib_storage.batchGetSignedUrls(
      photos.map((p) => p.key)
    );

    // Merge URLs back into photos
    const photosWithUrls = photos.map((photo) => {
      const signed = signedUrls.find((s) => s.key === photo.key);

      return {
        ...photo,
        presignedUrl: signed?.url || null,
      };
    });

    return photosWithUrls;

    // Go through photos and generate presignURL
  }
}
