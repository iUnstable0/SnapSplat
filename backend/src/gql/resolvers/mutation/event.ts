import { DateTime } from "luxon";

import prisma from "@/db/prisma";
import { EventRole } from "@/generated/prisma";

import lib_captcha from "@/modules/captcha";
import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";
import lib_storage from "@/modules/storage";

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
      .then(async (event) => {
        try {
          const eventFolder = `events/${event.eventId}`;
          const memberFolder = `${eventFolder}/members/${memberId}`;

          await lib_storage.createFolder(eventFolder);
          await lib_storage.createFolder(memberFolder);

          // TODO: Create a shared module that defines the structure of the R2 bucket
          // and a apply function that applies the structure based on the func input args
        } catch (error) {
          console.error(
            `${lib_logger.formatPrefix("mutation_event/createEvent")} Failed to create event folder`,
            error
          );
        }

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

  public static async deleteEvent(args: any) {
    const [parent, body, context] = args;

    const { captchaToken, eventId } = body;

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

    if (!eventId) {
      throw lib_error.bad_request("Missing required fields", "missing eventId");
    }

    // So many ways to check
    // Either get the event and check the hostUserId
    // Get the user events and check the hostUserId
    // Etc
    // Sob

    const event = await prisma.event.findUnique({
      where: {
        eventId: eventId,
      },
    });

    if (!event) {
      throw lib_error.not_found("Event not found", "eventId not found");
    }

    if (event.hostUserId !== context.user.userId) {
      throw lib_error.forbidden("Forbidden", "not the host");
    }

    if (!event.isDraft && !event.isArchived) {
      throw lib_error.bad_request(
        "Published events must be archived first",
        "event is not a draft or archived"
      );
    }

    return await prisma.event.delete({
      where: {
        eventId: eventId,
      },
    });
  }
}
