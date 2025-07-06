import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import lib_url from "@/modules/url";

export async function GET(request: Request): Promise<Response> {
  const cookieStore = await cookies();

  cookieStore.delete("token");
  cookieStore.delete("refresh_token");

  return NextResponse.redirect(
    new URL("/app/me/login", lib_url.getPublicUrl(request.url))
  );
}
