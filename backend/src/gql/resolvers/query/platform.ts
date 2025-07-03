import * as z from "zod/v4";

import prisma from "@/db/prisma";

import { Z_Platform } from "@/db/types";

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

    const rawPlatformInfo = await prisma.platform.findMany();

    const platformInfo = Z_Platform.parse(
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

    // console.log("platformInfo", platformInfo);

    // console.log("platformInfo", platformInfo);

    // lib_cache.set("platform_info", platformInfo, 60 * 60 * 24);

    return platformInfo;
  }
}
