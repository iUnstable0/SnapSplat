import { DateTime } from "luxon";

import prisma from "@/db/prisma";
import { EventRole } from "@/generated/prisma";

import lib_captcha from "@/modules/captcha";
import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";

export default class mutation_event {
  public static async createEvent(args: any, context: any) {
    const { captchaToken, name, description } = args;

    if (!captchaToken) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captchaToken is missing"
      );
    }

    const captchaValid = await lib_captcha.verify(
      captchaToken,
      context.request.headers["CF-Connecting-IP"] || null
    );

    if (!captchaValid) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captcha is not valid"
      );
    }

    if (!name) {
      throw lib_error.bad_request("Missing required fields", "missing name");
    }

    const memberId = crypto.randomUUID();

    return await prisma
      .$transaction(async (tx) => {
        const event = await tx.event.create({
          data: {
            name,
            description,

            startsAt: DateTime.now().plus({ days: 3 }).toISO(),
            endsAt: DateTime.now()
              .plus({ days: 7 + 3 })
              .toISO(),

            hostUser: {
              connect: {
                userId: context.user.userId,
              },
            },

            memberships: {
              create: {
                memberId: memberId,

                eventRole: EventRole.HOST,

                displayNameAlt: context.user.displayName,
                avatarAlt: context.user.avatar,

                user: {
                  connect: {
                    userId: context.user.userId,
                  },
                },
              },
            },
          },
          include: {
            memberships: true,
          },
        });

        const updatedEvent = await tx.event.update({
          where: {
            id: event.id,
          },
          data: {
            hostMember: {
              connect: {
                memberId: memberId,
              },
            },
          },
          include: {
            hostUser: true,
            hostMember: true,
            memberships: true,
          },
        });

        return updatedEvent;
      })
      .then((event) => {
        return event;
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_event/createEvent")} [${refId}] Failed to create event`,
          error
        );

        throw lib_error.internal_server_error(
          "Internal Server Error. refId: ${refId}",
          `500 failed to create event: ${error}`
        );
      });
  }
}
