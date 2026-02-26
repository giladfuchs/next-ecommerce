import { NextResponse } from "next/server";

import { localeCache } from "@/lib/config";

import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/he" || pathname === "/en") {
    const locale = pathname.slice(1) as "en"; // "he" or "en"
    const url = request.nextUrl.clone();
    url.pathname = "/";
    localeCache.set(locale);
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", locale);
    return response;
  }

  return NextResponse.next();
}
