import * as z from "zod/v4";

import { NextResponse } from "next/server";

import lib_token from "@/modules/token";

import type { NextRequest } from "next/server";

const guardedPaths = {
  "/app": {
    type: "token",
    onFailed: (request: NextRequest) => {
      return NextResponse.redirect(new URL("/login", request.url));
    },
    onSuccess: (request: NextRequest) => {
      return NextResponse.next();
    },
  },
  "/login": {
    type: "token",
    onFailed: (request: NextRequest) => {
      return NextResponse.next();
    },
    onSuccess: (request: NextRequest) => {
      return NextResponse.redirect(new URL("/app", request.url));
    },
  },
  "/register": {
    type: "token",
    onFailed: (request: NextRequest) => {
      return NextResponse.next();
    },
    onSuccess: (request: NextRequest) => {
      return NextResponse.redirect(new URL("/app", request.url));
    },
  },
  "/refresh": {
    type: "refresh_token",
    onFailed: (request: NextRequest) => {
      return NextResponse.redirect(new URL("/login", request.url));
    },
    onSuccess: (request: NextRequest) => {
      return NextResponse.next();
    },
  },
  "/setup": {
    type: "token",
    onFailed: (request: NextRequest) => {
      return NextResponse.next();
    },
    onSuccess: (request: NextRequest) => {
      return NextResponse.redirect(new URL("/app", request.url));
    },
  },
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const rootPath = `/${pathname.split("/")[1]}`;

  const options = guardedPaths[rootPath as keyof typeof guardedPaths];

  let token = null;

  // if (options.type === "token") {
  const tokenCookie = request.cookies.get("token");

  if (!tokenCookie) {
    return options.onFailed(request);
  }

  token = tokenCookie.value.replaceAll("Bearer ", "");
  // }

  // if (options.type === "refresh_token") {
  //   const refreshToken = request.cookies.get("refresh_token");
  //   if (!refreshToken) return options.onFailed(request);

  //   token = refreshToken.value;
  // }

  if (!token) {
    return options.onFailed(request);
  }

  const result = await lib_token.validateAuthToken(token);

  if (!result.valid || !result.payload) {
    if (!result.renew) {
      return options.onFailed(request);
    }

    if (options.type === "token") {
      // return NextResponse.redirect(new URL("/refresh", request.url));
      return NextResponse.redirect(
        new URL(`/refresh?redir=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  if (options.type === "refresh_token") {
    try {
      let refreshTokenCookie: any = request.cookies.get("refresh_token");

      if (!refreshTokenCookie) {
        return options.onFailed(request);
      }

      const refreshToken = refreshTokenCookie.value;

      const [userId, sessionId, sessionKey] = refreshToken.split(":");

      if (!userId || !sessionId || !sessionKey) {
        return options.onFailed(request);
      }

      z.uuidv4().parse(userId);
      z.uuidv4().parse(sessionId);
      z.string().parse(sessionKey);
    } catch (error) {
      return options.onFailed(request);
    }
  }

  if (pathname === "/app") {
    return NextResponse.redirect(new URL("/app/me", request.url));
  }

  if (pathname.startsWith("/app/event/")) {
    const splittedPath = pathname.split("/");

    // /app/event/123/my-gallery
    // /app/event/123/gallery
    // /app/event/123/board

    const eventId = splittedPath[3];
    const page = splittedPath[4];

    if (!page) {
      return NextResponse.redirect(
        new URL(`/app/event/${eventId}/home`, request.url)
      );
    }
  }

  return options.onSuccess(request);
}

export const config = {
  matcher: [
    "/app/:path*",
    "/login",
    "/register",
    "/refresh",
    "/platform/:path*",
    "/setup",
  ],
};
