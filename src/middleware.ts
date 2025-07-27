import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, /users, etc.)
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isAdminRoute = path.startsWith("/(admin-portal)_x23p9");
  const isAdminLoginRoute = path === "/admin-login";

  // Get the token from the request cookies
  const token = request.cookies.get("token")?.value;

  // If trying to access admin routes without token, redirect to admin login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  // If trying to access admin login with token, redirect to admin dashboard
  if (isAdminLoginRoute && token) {
    return NextResponse.redirect(new URL("/(admin-portal)_x23p9", request.url));
  }

  return NextResponse.next();
}

// Configure the paths that should be matched by this middleware
export const config = {
  matcher: ["/(admin-portal)_x23p9/:path*", "/admin-login"],
};
