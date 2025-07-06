import { GraphQLError } from "graphql";

export default class lib_error {
  private static parseMessage(normal: string, dev?: string) {
    let message = normal;

    if (dev && process.env.NODE_ENV === "development") {
      message = dev;
    }

    return message;
  }

  public static unauthorized(normal?: string, dev?: string) {
    return new GraphQLError(
      lib_error.parseMessage(normal ? normal : "Unauthorized", dev),
      {
        extensions: {
          code: "UNAUTHORIZED",
          http: { status: 401 },
        },
      }
    );
  }

  public static forbidden(normal?: string, dev?: string) {
    return new GraphQLError(
      lib_error.parseMessage(normal ? normal : "Forbidden", dev),
      {
        extensions: {
          code: "FORBIDDEN",
          http: { status: 403 },
        },
      }
    );
  }

  public static bad_request(normal?: string, dev?: string) {
    return new GraphQLError(
      lib_error.parseMessage(normal ? normal : "Bad Request", dev),
      {
        extensions: {
          code: "BAD_REQUEST",
          http: { status: 400 },
        },
      }
    );
  }

  public static not_found(normal?: string, dev?: string) {
    return new GraphQLError(
      lib_error.parseMessage(normal ? normal : "Not Found", dev),
      {
        extensions: {
          code: "NOT_FOUND",
          http: { status: 404 },
        },
      }
    );
  }

  public static internal_server_error(normal?: string, dev?: string) {
    return new GraphQLError(
      lib_error.parseMessage(normal ? normal : "Internal Server Error", dev),
      {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: { status: 500 },
        },
      }
    );
  }
}
