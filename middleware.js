// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { roleAccess } from "@/lib/roles";

const protectedRoutes = {
  "/dashboard/admin": roleAccess.admin,
  "/dashboard/manager": roleAccess.manager,
  "/dashboard/driver": roleAccess.driver,
  "/dashboard/coordinator": roleAccess.coordinator,
  "/dashboard/public": roleAccess.public,
};
const DEBUG = false;

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // If not signed in
  if (!token) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (DEBUG) {
    console.log("Token role:", token?.role);
  }

  // Check each protected route group
  for (const [routePrefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      // SUPER_ADMIN always allowed
      if (token.role === "SUPER_ADMIN") return NextResponse.next();

      if (!allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/unauthorised", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/driver/:path*",
    "/dashboard/manager/:path*",
    "/dashboard/coordinator/:path*",
    "/dashboard/public/:path*",
  ],
};
