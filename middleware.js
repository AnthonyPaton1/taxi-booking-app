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
  const url = new URL(req.url);
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If not signed in
  if (!token) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

const onboardingRoutes = {
  DRIVER: "/dashboard/driver/onboarding",
  ADMIN: "/dashboard/admin/onboarding",
};

const needsDriverOnboarding =
  token.role === "DRIVER" && !token.driverOnboarded;

const needsAdminOnboarding =
  token.role === "ADMIN" && !token.adminOnboarded;

if (needsDriverOnboarding && !url.pathname.startsWith("/dashboard/driver")) {
  const dest = new URL("/dashboard/driver", req.url);
  return NextResponse.redirect(dest);
}

if (needsAdminOnboarding && !url.pathname.startsWith("/dashboard/admin")) {
  const dest = new URL("/dashboard/admin", req.url);
  return NextResponse.redirect(dest);
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
    "/onboarding/driver",
  ],
};


