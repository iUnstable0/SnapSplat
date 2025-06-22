import Bun from "bun";

import { createYoga, createSchema } from "graphql-yoga";

import { useRateLimiter } from "@envelop/rate-limiter";

import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxDirectivesPlugin } from "@escape.tech/graphql-armor-max-directives";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";

import { DateTime } from "luxon";

import resolvers from "@/gql/resolvers";
import authDirectiveTransformer from "@/gql/directives/auth";

import lib_logger from "@/modules/logger";
import lib_token from "@/modules/token";

import prisma from "@/db/prisma";

import type { IdentifyFn } from "@envelop/rate-limiter";
import type { User } from "@/generated/prisma";

export default class gql {
  private static server: any = null;

  public static async start() {
    const identifyFn: IdentifyFn = (context: any) => {
      return context.request.ip;
    };

    interface MyContext {
      authenticated: boolean;
      user?: User | null;
      token?: string;
    }

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
        // console.log("omg!");
        let token = request.headers.get("authorization") || "";

        token = token.replace("Bearer ", "");

        if (token.length === 0) {
          return { authenticated: false };
        }

        const result = await lib_token.validateAuthToken(token);

        // console.log(result);

        let user;

        if (result.valid && result.payload) {
          const {
            userId,
            passwordSession,
            accountSession,
            jti: tokenId,
          } = result.payload;

          if (!userId) {
            return { authenticated: false };
          }

          user = await prisma.user
            .findUnique({
              where: {
                userId: userId,
              },
              include: {
                sessions: true,
                suspendedTokens: true,
              },
            })
            .catch((error) => {
              console.error(
                `${lib_logger.formatPrefix("gql_ctx")} Error fetching user from database:`,
                error,
              );

              return null;
            });

          if (!user) {
            return { authenticated: false };
          }

          if (
            user.passwordSession !== passwordSession ||
            user.accountSession !== accountSession
          ) {
            return { authenticated: false };
          }

          if (user.suspendedTokens.some((token) => tokenId === token.tokenId)) {
            console.warn(
              `${lib_logger.formatPrefix("gql_ctx")} Token is suspended for user ${user.userId}`,
            );

            return { authenticated: false };
          }
        }

        return {
          authenticated: result.valid,
          user,
        };
      },
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
