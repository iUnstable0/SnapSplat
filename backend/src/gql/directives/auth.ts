import { GraphQLSchema, defaultFieldResolver, GraphQLError } from "graphql";
import { mapSchema, MapperKind, getDirective } from "@graphql-tools/utils";

const directiveName = "auth";

function getUserFn(token: string) {}

export default function authDirectiveTransformer(schema: GraphQLSchema) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      // console.log("feet");
      const authDirective = getDirective(schema, type, directiveName)?.[0];

      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }

      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      // console.log("toes");
      const authDirective =
        getDirective(schema, fieldConfig, directiveName)?.[0] ??
        typeDirectiveArgumentMaps[typeName];

      if (authDirective) {
        const { requires } = authDirective;

        if (requires) {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = function (source, args, context, info) {
            // const user = getUserFn(context.headers["authorization"]);
            //
            // if (!user.hasRole(requires)) {
            //   throw new Error(`Unauthorized`);
            // }

            if (!context.authenticated) {
              throw new GraphQLError("Unauthorized", {
                extensions: {
                  code: "UNAUTHORIZED",
                  http: {
                    status: 401,
                    headers: {
                      "x-refresh-token-needed": context.renew
                        ? "true"
                        : "false",
                    },
                  },
                },
              });
            }

            // console.log(`Auth directive context:`, context);

            return resolve(source, args, context, info);
          };

          return fieldConfig;
        }
      }
    },
  });
}
