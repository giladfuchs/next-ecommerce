import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/he" || pathname === "/en") {
    const locale = pathname.slice(1); // "he" or "en"
    const url = request.nextUrl.clone();
    url.pathname = "/";

    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE" as any, locale as any);

    return response;
  }

  const response = NextResponse.next();

  response.headers.set("x-pathname", pathname);

  if (pathname.startsWith("/product")) {
    const segments = pathname.split("/").filter(Boolean);
    const handle = segments[1] || null;
    if (handle) {
      response.headers.set("x-product-handle", handle);
    }
  }

  return response;
}
