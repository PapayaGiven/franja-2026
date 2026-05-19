import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/auth";

/**
 * Two responsibilities:
 *
 *   1. Gate /admin/* (except /admin/login) behind the admin cookie.
 *      Unauthenticated requests are redirected to /admin/login, carrying
 *      the original pathname in ?next so we land back where they started.
 *
 *   2. Forward the current pathname to Server Components via the
 *      `x-pathname` request header. The root layout reads it so it can
 *      skip the public chrome (bottom nav, container widths) on /admin.
 *      RSC has no built-in way to see the URL, so the proxy is the
 *      idiomatic plumbing here.
 *
 * File renamed from `middleware.ts` to `proxy.ts` per Next 16 (see
 * https://nextjs.org/docs/messages/middleware-to-proxy).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Only /admin/* is gated. /admin/login itself must stay reachable.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const ok = await verifySession(token);
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      if (pathname !== "/admin") {
        url.searchParams.set("next", pathname + search);
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Skip static assets, image optimizer, and favicons — everything else
// (public app + admin) flows through so `x-pathname` is always set.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
