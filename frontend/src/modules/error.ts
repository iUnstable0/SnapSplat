import Error from "@/components/error";

export default class lib_error {
  private static parseMessage(normal: string, dev?: string) {
    let message = normal;

    if (dev && process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      message = dev;
    }

    return message;
  }

  public static unauthorized(
    type: "server" | "client",
    normal?: string,
    dev?: string
  ) {
    if (type === "server") {
      return new Response(
        lib_error.parseMessage(normal ? normal : "Unauthorized", dev),
        { status: 401 }
      );
    }

    return Error({
      title: lib_error.parseMessage(normal ? normal : "Unauthorized", dev),
    });
  }

  public static forbidden(
    type: "server" | "client",
    normal?: string,
    dev?: string
  ) {
    if (type === "server") {
      return new Response(
        lib_error.parseMessage(normal ? normal : "Forbidden", dev),
        { status: 403 }
      );
    }

    return Error({
      title: lib_error.parseMessage(normal ? normal : "Forbidden", dev),
    });
  }

  public static bad_request(
    type: "server" | "client",
    normal?: string,
    dev?: string
  ) {
    if (type === "server") {
      return new Response(
        lib_error.parseMessage(normal ? normal : "Bad Request", dev),
        { status: 400 }
      );
    }

    return Error({
      title: lib_error.parseMessage(normal ? normal : "Bad Request", dev),
    });
  }

  public static internal_server_error(
    type: "server" | "client",
    normal?: string,
    dev?: string
  ) {
    if (type === "server") {
      return new Response(
        lib_error.parseMessage(normal ? normal : "Internal Server Error", dev),
        { status: 500 }
      );
    }

    return Error({
      title: lib_error.parseMessage(
        normal ? normal : "Internal Server Error",
        dev
      ),
    });
  }
}
