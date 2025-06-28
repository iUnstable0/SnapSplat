export default class lib_error {
  private static parseMessage(normal: string, dev?: string) {
    let message = normal;

    if (dev && process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      message = dev;
    }

    return message;
  }

  public static unauthorized(normal?: string, dev?: string) {
    return new Response(
      lib_error.parseMessage(normal ? normal : "Unauthorized", dev),
      { status: 401 }
    );
  }

  public static bad_request(normal?: string, dev?: string) {
    return new Response(
      lib_error.parseMessage(normal ? normal : "Bad Request", dev),
      { status: 400 }
    );
  }

  public static internal_server_error(normal?: string, dev?: string) {
    return new Response(
      lib_error.parseMessage(normal ? normal : "Internal Server Error", dev),
      { status: 500 }
    );
  }
}
