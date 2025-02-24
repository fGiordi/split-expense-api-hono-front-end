import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Define public routes that don't require a token
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // Redirect to /auth/login if no token and trying to access a protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Allow the request to proceed if token exists or it's a public route
  return NextResponse.next();
}

// Apply middleware to specific routes, excluding API and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
