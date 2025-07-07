import { DateTime } from "luxon";

import prisma from "@/db/prisma";
import { type EventPhoto, EventRole } from "@/generated/prisma";

import lib_captcha from "@/modules/captcha";
import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";
import lib_storage from "@/modules/storage";
import lib_role from "@/modules/role";
import { Z_UpdateEvent, Z_InviteCode } from "@/modules/parser";
import sharp from "sharp";

export default class mutation_event {
  public static async joinEvent(args: any) {
    const [parent, body, context] = args;

    const { captchaToken, inviteCode } = body;

    if (!captchaToken) {
      throw lib_error.bad_request(
        "Captcha verification failed",
        "captchaToken is missing"
      );
    }

    if (!inviteCode) {
      throw lib_error.bad_request(
        "Missing required fields",
        "missing inviteCode"
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

    const parsedInviteCode = Z_InviteCode.safeParse(inviteCode);

    if (!parsedInviteCode.success) {
      throw lib_error.bad_request(
        "Invalid invite code",
        `Invalid invite code: ${JSON.stringify(parsedInviteCode.error.message)}`
      );
    }

    let eventInvite = null;

    try {
      eventInvite = await prisma.eventInvite.findUnique({
        where: {
          inviteCode: parsedInviteCode.data.toLowerCase(),
        },
        include: {
          event: true,
        },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("mutation_event/joinEvent")} [${refId}] Failed to find event invite`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to find event invite: ${error}`
      );
    }

    if (!eventInvite) {
      throw lib_error.not_found("Invite code not found");
    }

    if (
      eventInvite.expiresAt &&
      DateTime.fromJSDate(eventInvite.expiresAt) < DateTime.now()
    ) {
      throw lib_error.bad_request(
        "Invite code not found",
        "Invite code expired"
      );
    }

    if (eventInvite.event.isDraft) {
      throw lib_error.bad_request(
        "Invite code not found",
        "Event is not published"
      );
    }

    if (eventInvite.maxUses > 0 && eventInvite.uses >= eventInvite.maxUses) {
      throw lib_error.bad_request(
        "Invite code not found",
        "Invite code has reached its limit"
      );
    }

    const memberId = crypto.randomUUID();

    return await prisma
      .$transaction(async (tx) => {
        const membership = await tx.eventMembership.create({
          data: {
            eventId: eventInvite.event.eventId,

            eventRole: eventInvite.role,

            displayNameAlt: context.user.displayName,
            avatarAlt: context.user.avatar,

            isApproved: !eventInvite.requireApproval,

            userId: context.user.userId,

            memberId: memberId,
          },
        });

        const updatedInvite = await tx.eventInvite.update({
          where: {
            inviteCode: parsedInviteCode.data.toLowerCase(),
          },
          data: {
            uses: { increment: 1 },
          },
        });

        return eventInvite.event;
      })
      .then(async (event) => {
        return event;
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_event/joinEvent")} [${refId}] Failed to join event`,
          error
        );

        throw lib_error.internal_server_error(
          "Internal Server Error. refId: ${refId}",
          `500 failed to join event: ${error}`
        );
      });

    // return await prisma.eventMembership
    //   .create({
    //     data: {
    //       eventId: eventInvite.event.eventId,

    //       eventRole: eventInvite.role,

    //       displayNameAlt: context.user.displayName,
    //       avatarAlt: context.user.avatar,

    //       isApproved: !eventInvite.requireApproval,

    //       userId: context.user.userId,

    //       memberId: memberId,
    //     },
    //   })
    //   .then(async () => {
    //     return eventInvite.event;
    //   })
    //   .catch((error) => {
    //     switch (error.code) {
    //       case "P2002":
    //         throw lib_error.bad_request(
    //           "You are already a member of this event"
    //         );
    //       default:
    //         const refId = Bun.randomUUIDv7();

    //         console.error(
    //           `${lib_logger.formatPrefix("mutation_event/joinEvent")} [${refId}] Failed to join event`,
    //           error
    //         );

    //         throw lib_error.internal_server_error(
    //           "Internal Server Error. refId: ${refId}",
    //           `500 failed to join event: ${error}`
    //         );
    //     }
    //   });
  }

  public static async leaveEvent(args: any) {
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

    // const event = await prisma.event.findUnique({
    //   where: {
    //     eventId: eventId,
    //   },
    // });

    // if (!event) {
    //   throw lib_error.not_found("Event not found", "eventId not found");
    // }

    // if (event.hostUserId === context.user.userId) {
    //   throw lib_error.bad_request("You cannot leave your own event");
    // }

    const membership = await prisma.eventMembership.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: context.user.userId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!membership) {
      throw lib_error.not_found("Event not found/not a member");
    }

    if (membership.event.hostUserId === context.user.userId) {
      throw lib_error.bad_request("You cannot leave your own event");
    }

    return await prisma.eventMembership
      .delete({
        where: {
          memberId: membership.memberId,
        },
      })
      .then(async () => {
        return true;
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_event/leaveEvent")} [${refId}] Failed to leave event`,
          error
        );

        throw lib_error.internal_server_error(
          "Internal Server Error. refId: ${refId}",
          `500 failed to leave event: ${error}`
        );
      });
  }

  public static async createEvent(args: any) {
    const [parent, body, context] = args;

    const { captchaToken, name, description } = body;

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
        const inviteId = crypto.randomUUID();

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

            invites: {
              create: {
                inviteId: inviteId,
                inviteCode: inviteId.slice(0, 6),

                role: EventRole.ATTENDEE,
                requireApproval: false,
              },
            },
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
            invites: true,
          },
        });

        return updatedEvent;
      })
      .then(async (event) => {
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

  public static async uploadPhoto(args: any) {
    const [parent, body, context] = args;

    const { captchaToken, eventId, file } = body;

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

    if (!file) {
      throw lib_error.bad_request("Missing required fields", "missing file");
    }

    const membershipInfo = await prisma.eventMembership.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: context.user.userId,
        },
      },
    });

    if (!membershipInfo) {
      throw lib_error.forbidden("Forbidden", "not a member");
    }

    // read the file and save to temp storage
    // save to db
    // return the photo info

    // check file size and mime

    const fileSize = file.size;

    // 20mb
    if (fileSize > 20 * 1024 * 1024) {
      throw lib_error.bad_request("File too large", "file is too large");
    }

    const mimeType = file.type;

    if (!mimeType.startsWith("image/")) {
      throw lib_error.bad_request("Invalid file type", "file is not an image");
    }

    const db = `event/${eventId}/photos`;

    const compressedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .jpeg()
      .toBuffer();

    const imageMeta = await sharp(compressedBuffer).metadata();

    const key = await lib_storage.uploadBuffer(db, compressedBuffer, {
      name: `${crypto.randomUUID()}.jpeg`,
      mimeType: "image/jpeg",
      size: compressedBuffer.length,
    });

    return await prisma.eventPhoto
      .create({
        data: {
          eventId: eventId,
          key: key,
          width: imageMeta.width,
          height: imageMeta.height,
          mimeType: "image/jpeg",
          userId: context.user.userId,
          memberId: membershipInfo.memberId,
        },
      })
      .then(async (eventPhoto) => {
        return eventPhoto;
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_event/uploadPhoto")} [${refId}] Failed to upload photo`,
          error
        );

        throw lib_error.internal_server_error(
          "Internal Server Error. refId: ${refId}",
          `500 failed to upload photo: ${error}`
        );
      });
  }

  public static async updateEvent(args: any) {
    const [parent, body, context] = args;

    const { captchaToken, eventId, data } = body;

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

    if (!eventId || !data) {
      throw lib_error.bad_request("Missing required fields", "missing eventId");
    }

    const membershipInfo = await prisma.eventMembership.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: context.user.userId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!membershipInfo) {
      throw lib_error.forbidden("Forbidden", "not a member");
    }

    if (!lib_role.event_hasRole(membershipInfo.eventRole, EventRole.COHOST)) {
      throw lib_error.forbidden("Forbidden", "not a cohost or up");
    }

    const eventInfo = membershipInfo.event;

    if (data.isDraft === true) {
      throw lib_error.bad_request(
        "Events cannot be unpublished",
        "isDraft is true. event cant be unpublished"
      );
    }

    if (data.isArchived === true && eventInfo.isDraft) {
      throw lib_error.bad_request(
        "Draft events cannot be archived",
        "isArchived is true. can't archive a draft event"
      );
    }

    if ("isDraft" in data && "isArchived" in data) {
      throw lib_error.bad_request(
        "Too many actions",
        "isDraft and isArchived cannot exists at the same time. pick one :skull:"
      );
    }

    if ("isArchived" in data) {
      throw lib_error.bad_request(
        "Not implemented",
        "isArchived is not implemented"
      );
    }

    const parseResult = Z_UpdateEvent.safeParse(data);

    if (!parseResult.success) {
      throw lib_error.bad_request(
        "Invalid data",
        `Invalid data: ${JSON.stringify(parseResult.error.message)}`
      );
    }

    const parsedData = parseResult.data;

    const newData: any = {};

    console.log(parsedData);

    if (
      "isArchived" in parsedData &&
      parsedData.isArchived !== eventInfo.isArchived
    ) {
      newData.isArchived = parsedData.isArchived;
    }

    if ("isDraft" in parsedData && parsedData.isDraft !== eventInfo.isDraft) {
      newData.isDraft = parsedData.isDraft;
    }

    if ("name" in parsedData && parsedData.name !== eventInfo.name) {
      newData.name = parsedData.name;
    }

    if (
      "description" in parsedData &&
      parsedData.description !== eventInfo.description
    ) {
      newData.description = parsedData.description;
    }

    console.log(newData);

    if (Object.keys(newData).length === 0) {
      console.log(
        `${lib_logger.formatPrefix("mutation_event/updateEvent")} No changes to update`
      );

      return eventInfo;
    }

    return await prisma.event
      .update({
        where: {
          eventId: eventId,
        },
        data: newData,
      })
      .then(async (event) => {
        return event;
      })
      .catch((error) => {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("mutation_event/updateEvent")} [${refId}] Failed to update event`,
          error
        );

        throw lib_error.internal_server_error(
          "Internal Server Error. refId: ${refId}",
          `500 failed to update event: ${error}`
        );
      });
  }

  public static async deletePhoto(args: any) {
    const [parent, body, context] = args;

    const { captchaToken, photoId } = body;

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

    if (!photoId) {
      throw lib_error.bad_request("Missing required fields", "missing photoId");
    }

    let photo: EventPhoto | null = null;

    try {
      photo = await prisma.eventPhoto.findUnique({
        where: { photoId: photoId },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("mutation_event/deletePhoto")} [${refId}] Failed to find photo`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to delete photo: ${error}`
      );
    }

    if (!photo) {
      throw lib_error.not_found("Photo not found", "photoId not found");
    }

    if (photo.userId !== context.user.userId) {
      throw lib_error.forbidden("Forbidden", "not the owner");
    }

    try {
      await prisma.eventPhoto.delete({
        where: { photoId: photoId },
      });
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("mutation_event/deletePhoto")} [${refId}] Failed to delete photo`,
        error
      );

      throw lib_error.internal_server_error(
        "Internal Server Error. refId: ${refId}",
        `500 failed to delete photo: ${error}`
      );
    }

    await lib_storage.deleteFile(photo.key);

    return true;
  }
}
