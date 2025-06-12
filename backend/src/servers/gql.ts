import Bun from "bun";

import { createYoga, createSchema } from "graphql-yoga";

import { useRateLimiter } from "@envelop/rate-limiter";

import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxDirectivesPlugin } from "@escape.tech/graphql-armor-max-directives";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";

import resolvers from "@/gql/resolvers";

import type { IdentifyFn } from "@envelop/rate-limiter";

export default class GQL {
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
        defaultQuery: /* GraphQL */ `
          query {
            hello
          }
        `,
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

    console.info(
      `Server is running on ${new URL(
        yoga.graphqlEndpoint,
        `http://${server.hostname}:${server.port}`,
      )}`,
    );

    // const server = new ApolloServer<MyContext>({
    //   schema,
    //   introspection: process.env.NODE_ENV !== "production",
    // });
    //
    // const { url } = await startStandaloneServer(server, {
    //   // Your async context function should async and
    //
    //   // return an object
    //
    //   context: async ({ req, res }) => {
    //     let token = req.headers["authorization"] as string | null;
    //
    //     token = token ? token.replace("Bearer ", "") : null;
    //   },
    // });
  }
}
