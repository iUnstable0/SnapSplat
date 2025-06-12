import Bun from "bun";

import { createYoga, createSchema } from "graphql-yoga";

import { useRateLimiter } from "@envelop/rate-limiter";

import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxDirectivesPlugin } from "@escape.tech/graphql-armor-max-directives";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";

import resolvers from "@/gql/resolvers";

import lib_logger from "@/modules/logger";

import type { IdentifyFn } from "@envelop/rate-limiter";

export default class gql {
  private static server: any = null;

  public static async start() {
    const identifyFn: IdentifyFn = (context: any) => {
      return context.request.ip;
    };

    interface MyContext {
      authenticated: boolean;
      token?: string;
    }

    const schema = createSchema({
      typeDefs: await Bun.file("./src/gql/schema.gql").text(),
      resolvers,
    });

    const yoga = createYoga({
      schema,
      graphiql: {
        defaultQuery: await Bun.file("./src/gql/default.gql").text(),
      },
      plugins: [
        useRateLimiter({
          identifyFn,
        }),
        maxAliasesPlugin({
          n: 15,
        }),
        maxDepthPlugin({
          n: 6,
        }),
        maxDirectivesPlugin({
          n: 50,
        }),
        maxTokensPlugin({
          n: 1000,
        }),
      ],
    });

    const server = Bun.serve({
      fetch: yoga,
      port: process.env.GQL_PORT,
    });

    gql.server = server;

    console.info(
      `${lib_logger.formatPrefix("gql")} Running on ${new URL(
        yoga.graphqlEndpoint,
        `http://${server.hostname}:${server.port}`,
      )}`,
    );
  }

  public static async stop() {
    if (gql.server) {
      await gql.server.stop();
      console.info(`${lib_logger.formatPrefix("gql")} Server stopped.`);
    } else {
      console.warn(`${lib_logger.formatPrefix("gql")} No server to stop.`);
    }

    return true;
  }
}
