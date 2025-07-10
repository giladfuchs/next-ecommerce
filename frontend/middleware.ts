import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { localeCache } from "./lib/api";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/he" || pathname === "/en") {
    const locale = pathname.slice(1); // "he" or "en"
    const url = request.nextUrl.clone();
    url.pathname = "/";
    localeCache.set(locale as "en");
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE" as any, locale as any);

    return response;
  }

  return NextResponse.next();
}
