import prisma from "@/db/prisma";

import lib_error from "@/modules/error";
import lib_logger from "@/modules/logger";

import { Z_Platform, type T_Platform } from "@/db/types";

export default class query_platform {
  public static async getInfo() {
    // console.log("booger");
    // const cache = await lib_cache.get("platform_info");

    // if (cache.data) {
    //   console.log("cache hit");
    //   console.log("cache.data", cache.data);
    //   return cache.data;
    // }

    // console.log("cache miss");

    let platformInfo: T_Platform;

    try {
      const rawPlatformInfo = await prisma.platform.findMany();

      platformInfo = Z_Platform.parse(
        rawPlatformInfo
          // Zod should auto filter out keys not defined in the schema
          // .filter((info) => !info.key.startsWith("SENSITIVE_"))
          .reduce(
            (acc, curr) => {
              acc[curr.key] = curr.value;
              return acc;
            },
            {} as Record<string, string>
          )
      );
    } catch (error) {
      const refId = Bun.randomUUIDv7();

      console.error(
        `${lib_logger.formatPrefix("query_platform/getInfo")} [${refId}] Failed to get platform info`,
        error
      );

      throw lib_error.internal_server_error(
        `Internal Server Error. refId: ${refId}`,
        `500 failed to get platform info: ${error}`
      );
    }

    // console.log("platformInfo", platformInfo);

    // console.log("platformInfo", platformInfo);

    // lib_cache.set("platform_info", platformInfo, 60 * 60 * 24);

    return platformInfo;
  }
}
