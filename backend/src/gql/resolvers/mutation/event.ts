import { DateTime } from "luxon";

import prisma from "@/db/prisma";

import lib_captcha from "@/modules/captcha";
import lib_error from "@/modules/error";

export default class mutation_event {
  public static async createEvent(args: any, context: any) {
    const { captchaToken, name, description, startsAt, endsAt } = args;

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

    if (!name || !startsAt || !endsAt) {
      throw lib_error.bad_request(
        "Missing required fields",
        "missing name/startsAt/endsAt"
      );
    }

    if (startsAt > endsAt) {
      throw lib_error.bad_request(
        "Invalid date range",
        "startsAt must be before endsAt"
      );
    }

    const startsAtLuxon = DateTime.fromISO(startsAt);
    const endsAtLuxon = DateTime.fromISO(endsAt);
    const nowLuxon = DateTime.now();

    console.log(startsAtLuxon, endsAtLuxon, nowLuxon);

    // const startsAtMinutes = startsAtLuxon.diff(nowLuxon, "minutes").minutes;
    // const endsAtMinutes = endsAtLuxon.diff(nowLuxon, "minutes").minutes;

    // if (startsAtMinutes < 0 || endsAtMinutes < 0) {
    //   throw lib_error.bad_request(
    //     "Invalid date range",
    //     "startsAt and endsAt must be in the future"
    //   );
    // }
    // const event = await prisma.event.create({
    //   data: {
    //     name,
    //     description,
    //     startsAt,
    //     endsAt,
    //     host: { connect: { userId: context.user.userId } },
    //   },
    // });
  }
}
