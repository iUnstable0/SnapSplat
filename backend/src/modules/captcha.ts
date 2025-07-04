import axios from "axios";

import lib_logger from "@/modules/logger";

export default class lib_captcha {
  public static async verify(token: string, ip: string): Promise<boolean> {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `${lib_logger.formatPrefix("captcha")} Skipping verification in non-production environment`
      );

      return Promise.resolve(true);
    }

    // Just skip for now
    console.warn(
      `${lib_logger.formatPrefix("captcha")} Skipping verification in non-production environment`
    );

    return Promise.resolve(true);

    return axios
      .request({
        method: "POST",
        url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          secret: process.env.CFTS_SECRET_KEY,
          response: token,
          remoteip: ip,
        },
      })
      .then((response: any) => {
        if (response.data.success) {
          return Promise.resolve(true);
        } else {
          return Promise.reject(false);
        }
      })
      .catch((error) => {
        console.error(
          `${lib_logger.formatPrefix("captcha")} Error during verification`,
          error
        );

        return Promise.reject(false);
      });
  }
}
