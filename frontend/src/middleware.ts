import { NextResponse } from "next/server";

import lib_token from "@/modules/token";

import type { NextRequest } from "next/server";

const guardedPaths = {
  "/app": {
    source: "cookie",
    onFailed: (request: NextRequest) => {
      return NextResponse.redirect(new URL("/login", request.url));
    },
  },
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!(pathname in guardedPaths)) return;

  const options = guardedPaths[pathname as keyof typeof guardedPaths];

  let token = null;

  if (options.source === "cookie") {
    const authToken = request.cookies.get("Authorization");
    if (!authToken) return options.onFailed(request);

    token = authToken.value.replaceAll("Bearer ", "");
  }

  if (options.source === "params") {
    token = null;
  }

  // console.log(token);

  if (!token) return options.onFailed(request);

  const result = await lib_token.validateAuthToken(token);

  if (!result.valid || !result.payload) {
    return options.onFailed(request);
  }

  // return NextResponse.redirect(new URL("/home", request.url));
}

export const config = {
  matcher: "/app/:path*",
};
