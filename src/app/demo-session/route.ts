import { NextResponse } from "next/server";
import { DEMO_AUTH_BYPASS_ENABLED } from "@/lib/auth/demo";

export function GET(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? url.host;
  const protocol =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const origin = `${protocol}://${host}`;
  if (!DEMO_AUTH_BYPASS_ENABLED)
    return NextResponse.redirect(new URL("/login", origin));

  return NextResponse.redirect(new URL("/dashboard", origin));
}
