const {
  NEXT_PUBLIC_PROTOCOL,
  NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_DOMAIN,
  NEXT_PUBLIC_PORT,
} = process.env;

export default class lib_url {
  public static getPublicUrl(url: string) {
    if (NEXT_PUBLIC_NODE_ENV !== "production") {
      return url;
    }

    return url
      .replaceAll(`localhost`, NEXT_PUBLIC_DOMAIN)
      .replaceAll(`:${NEXT_PUBLIC_PORT}`, ``)
      .replaceAll(`http://`, NEXT_PUBLIC_PROTOCOL || "https://");
  }
}
