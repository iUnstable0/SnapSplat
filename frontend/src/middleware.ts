import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import * as z from "zod/v4";

import lib_token from "@/modules/token";
import lib_url from "@/modules/url";
import { refreshTokenCookieOpt, tokenCookieOpt } from "./modules/cookie";

const GUEST_PATHS = ["/app/me/login", "/app/me/register", "/app/me/setup"];

const PROTECTED_APP_PATH_PREFIX = "/app";

const LEGACY_PATH_MAP: { [key: string]: string } = {
  "/login": "/app/me/login",
  "/register": "/app/me/register",
  "/setup": "/app/me/setup",
};

function handleAuthFailure(
  request: NextRequest,
  deleteRefreshToken: boolean = false
): NextResponse {
  console.log("Invalid auth, redirecting to login");

  const { pathname } = request.nextUrl;

  //   if (pathname.startsWith("/api/")) {
  //     return new NextResponse(
  //       JSON.stringify({ message: "Authentication required." }),
  //       { status: 401 }
  //     );
  //   }

  const loginUrl = new URL("/app/me/login", lib_url.getPublicUrl(request.url));

  if (pathname !== "/") {
    if (!pathname.startsWith("/app/me")) {
      loginUrl.searchParams.set("redir", encodeURIComponent(pathname));
    }
  }

  return NextResponse.redirect(loginUrl);
}

function validateRefreshToken(request: NextRequest): boolean {
  const refreshTokenCookie = request.cookies.get("refresh_token");

  if (!refreshTokenCookie) return false;

  const [userId, sessionId, sessionKey] = refreshTokenCookie.value.split(":");

  const schema = z.tuple([z.uuidv4(), z.uuidv4(), z.string()]);

  return schema.safeParse([userId, sessionId, sessionKey]).success;
}

export async function middleware(request: NextRequest) {
  console.log("Guarding", request.url);

  const { pathname } = request.nextUrl;

  if (LEGACY_PATH_MAP[pathname]) {
    console.log("Redirecting legacy path:", pathname);

    const newUrl = new URL(
      LEGACY_PATH_MAP[pathname],
      lib_url.getPublicUrl(request.url)
    );

    return NextResponse.redirect(newUrl);
  }

  if (pathname === "/refresh") {
    console.log("Handling refresh token request");
    if (!validateRefreshToken(request)) {
      return handleAuthFailure(request, true);
    }

    return NextResponse.next();
  }

  if (pathname === "/logout") {
    console.log("Handling logout request");

    const response = NextResponse.redirect(
      new URL("/app/me/login", lib_url.getPublicUrl(request.url))
    );

    response.cookies.set("token", "", {
      ...tokenCookieOpt,
      maxAge: 0,
    });
    response.cookies.set("refresh_token", "", {
      ...refreshTokenCookieOpt,
      maxAge: 0,
    });

    console.log("Logout response", response.cookies.getAll());

    return response;
  }

  const tokenCookie = request.cookies.get("token");
  const hasAuthToken = !!tokenCookie;

  if (hasAuthToken && GUEST_PATHS.includes(pathname)) {
    console.log("Autism");
    const appUrl = new URL(
      PROTECTED_APP_PATH_PREFIX,
      lib_url.getPublicUrl(request.url)
    );
    console.log("Autism redirect", appUrl);

    return NextResponse.redirect(appUrl);
  }

  // 4. Handle Protected Application Paths
  if (pathname.startsWith(PROTECTED_APP_PATH_PREFIX)) {
    console.log("Handling protected app path:", pathname);

    // If it's a protected path but not a guest-only one (like /app/me)
    if (!GUEST_PATHS.includes(pathname)) {
      if (!hasAuthToken) {
        return handleAuthFailure(request);
      }

      // Validate the token
      const token = tokenCookie.value.replace("Bearer ", "");
      const result = await lib_token.validateAuthToken(token);

      if (!result.valid) {
        // If the token is invalid but renewable, redirect to the refresh path.
        if (result.renew) {
          const refreshUrl = new URL(
            "/refresh",
            lib_url.getPublicUrl(request.url)
          );
          refreshUrl.searchParams.set("redir", encodeURIComponent(pathname));
          return NextResponse.redirect(refreshUrl);
        }
        // Otherwise, authentication fails.
        return handleAuthFailure(request);
      }
    }
  }

  if (pathname === "/app") {
    return NextResponse.redirect(
      new URL("/app/me", lib_url.getPublicUrl(request.url))
    );
  }

  if (/^\/app\/event\/[^/]+$/.test(pathname)) {
    return NextResponse.redirect(
      new URL(`${pathname}/home`, lib_url.getPublicUrl(request.url))
    );
  }

  return NextResponse.next();
}

// --- Matcher Configuration ---

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",

    "/login",
    "/register",
    "/refresh",
    "/setup",
    "/app/:path*",
  ],
};
