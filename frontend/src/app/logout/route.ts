import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  const cookieStore = await cookies();

  cookieStore.delete("token");
  cookieStore.delete("refresh_token");

  return NextResponse.redirect(new URL("/app/me/login", request.url));
}
