import Bun from "bun";

import { createYoga, createSchema } from "graphql-yoga";

import { useRateLimiter } from "@envelop/rate-limiter";

import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxDirectivesPlugin } from "@escape.tech/graphql-armor-max-directives";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";

import resolvers from "@/gql/resolvers";
import authDirectiveTransformer from "@/gql/directives/auth";

import lib_logger from "@/modules/logger";
import lib_auth from "@/modules/auth";

import prisma from "@/db/prisma";

import type { IdentifyFn } from "@envelop/rate-limiter";
import type { Session, SuspendedToken, User } from "@/generated/prisma";

const identifyFn: IdentifyFn = (context: any) => {
  return context.request.ip;
};

interface MyContext {
  authenticated: boolean;
  renew?: boolean;
  user?: User | null;
  token?: string;
}

export default class gql {
  private static server: any = null;

  public static async start() {
    let schema = createSchema({
      typeDefs: await Bun.file("./src/gql/schema.gql").text(),
      resolvers,
    });

    schema = authDirectiveTransformer(schema);

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
      context: async ({ request }): Promise<MyContext> => {
        return await lib_auth.getContext(request);
      },
    });

    const server = Bun.serve({
      fetch: yoga,
      port: process.env.GQL_PORT,
    });

    this.server = server;

    console.log(
      `${lib_logger.formatPrefix("gql")} Running on ${new URL(
        yoga.graphqlEndpoint,
        `http://${server.hostname}:${server.port}`
      )}`
    );

    console.info(
      `${lib_logger.formatPrefix("gql")} SETUP_KEY: ${process.env.SETUP_KEY}`
    );

    console.info(
      `${lib_logger.formatPrefix("gql")} Visit ${
        process.env.NEXT_URL
      }/setup to setup a super admin account if you havent already`
    );
  }

  public static async stop() {
    if (this.server) {
      await this.server.stop();

      console.log(`${lib_logger.formatPrefix("gql")} Server stopped.`);
    } else {
      console.log(`${lib_logger.formatPrefix("gql")} No server to stop.`);
    }
  }
}
