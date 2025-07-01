import {
  GlideClient,
  GlideClusterClient,
  Logger,
  TimeUnit,
} from "@valkey/valkey-glide";

import lib_logger from "@/modules/logger";

const addresses = [
  {
    host: process.env.VALKEY_HOST,
    port: process.env.VALKEY_PORT,
  },
];

const client = await GlideClient.createClient({
  addresses: addresses,
  requestTimeout: 500,
  clientName: "snapsplat",
});

export default class lib_cache {
  public static async get(key: string) {
    if (!process.env.CACHE_ENABLED) {
      return {
        data: null,
      };
    }

    try {
      const data = await client.get(key);

      if (!data) {
        return {
          data: null,
        };
      }

      try {
        return {
          data: JSON.parse(data.toString()),
        };
      } catch (error) {
        return {
          data,
        };
      }
    } catch (error) {
      return {
        data: null,
      };
    }
  }

  public static async set(key: string, value: object | string, ttl?: number) {
    if (!process.env.CACHE_ENABLED) {
      return;
    }

    try {
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }

      if (ttl) {
        return await client.set(key, value, {
          expiry: { type: TimeUnit.Seconds, count: ttl },
        });
      }

      return await client.set(key, value);
    } catch (error) {
      console.error(
        `${lib_logger.formatPrefix("lib_cache.set")} Error while setting key ${key} to value ${value}`,
        error
      );

      throw error;
    }
  }

  public static async del(key: string) {
    if (!process.env.CACHE_ENABLED) {
      return;
    }

    try {
      await client.del([key]);
    } catch (error) {
      console.error(
        `${lib_logger.formatPrefix("lib_cache.set")} Error while deleting key ${key}`,
        error
      );

      throw error;
    }
  }
}
