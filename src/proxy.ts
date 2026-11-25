import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

/**
 * Optimistic check only: redirect visitors without a session cookie away from app pages.
 * Real authorization happens in pages (requireUser) and route handlers (guarded).
 */
export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((n) => request.cookies.has(n));
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/practice/:path*",
    "/mistakes/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
