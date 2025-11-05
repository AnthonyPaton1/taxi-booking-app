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

// Add API route protection
const protectedApiRoutes = {
  "/api/admin": roleAccess.admin,
  "/api/coordinator": roleAccess.coordinator,
  "/api/manager": roleAccess.manager,
  "/api/driver": roleAccess.driver,
  "/api/bookings": ["ADMIN", "MANAGER", "COORDINATOR"], // Multiple roles allowed
  "/api/bids": ["DRIVER", "MANAGER", "ADMIN"],
  "/api/rides": ["ADMIN", "MANAGER", "COORDINATOR", "DRIVER"],
  "/api/residents": ["ADMIN", "MANAGER", "COORDINATOR"],
  "/api/incidents": ["ADMIN", "MANAGER", "COORDINATOR", "DRIVER"],
  "/api/invite": roleAccess.admin,
  "/api/onboarding": ["ADMIN", "DRIVER", "MANAGER", "COORDINATOR"],
  "/api/edit-details": ["ADMIN", "COORDINATOR"],
  "/api/user": roleAccess.admin,
};

const DEBUG = false;

// Security headers function
function applySecurityHeaders(response) {
  const securityHeaders = {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google.com https://res.cloudinary.com",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'"
    ].join('; '),
  };

  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Strict-Transport-Security'] = 
      'max-age=31536000; includeSubDomains; preload';
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function middleware(req) {
  const url = new URL(req.url);
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If not signed in, redirect to sign-in
  if (!token) {
    const response = NextResponse.redirect(new URL("/api/auth/signin", req.url));
    return applySecurityHeaders(response);
  }

  const onboardingRoutes = {
    DRIVER: "/dashboard/driver/onboarding",
    ADMIN: "/dashboard/admin/onboarding",
  };

  const needsDriverOnboarding = token.role === "DRIVER" && !token.driverOnboarded;
  const needsAdminOnboarding = token.role === "ADMIN" && !token.adminOnboarded;

  if (needsDriverOnboarding && !url.pathname.startsWith("/dashboard/driver")) {
    const dest = new URL("/dashboard/driver", req.url);
    const response = NextResponse.redirect(dest);
    return applySecurityHeaders(response);
  }

  if (needsAdminOnboarding && !url.pathname.startsWith("/dashboard/admin")) {
    const dest = new URL("/dashboard/admin", req.url);
    const response = NextResponse.redirect(dest);
    return applySecurityHeaders(response);
  }

  if (DEBUG) {
    console.log("Token role:", token?.role);
  }

  // Check protected dashboard routes
  for (const [routePrefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (token.role === "SUPER_ADMIN") {
        const response = NextResponse.next();
        return applySecurityHeaders(response);
      }

      if (!allowedRoles.includes(token.role)) {
        const response = NextResponse.redirect(new URL("/unauthorised", req.url));
        return applySecurityHeaders(response);
      }
    }
  }

  // 🔒 NEW: Check protected API routes
  for (const [routePrefix, allowedRoles] of Object.entries(protectedApiRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      // SUPER_ADMIN always allowed
      if (token.role === "SUPER_ADMIN") {
        const response = NextResponse.next();
        return applySecurityHeaders(response);
      }

      if (!allowedRoles.includes(token.role)) {
        // Return 403 Forbidden for API routes (not redirect)
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'Insufficient permissions' }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(
                Object.entries(applySecurityHeaders(NextResponse.next()).headers)
              )
            }
          }
        );
      }
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/driver",
    "/api/admin/:path*",
    "/api/coordinator/:path*",
    "/api/manager/:path*",
    "/api/driver/:path*",
    "/api/bookings/advanced/:path*",
    "/api/bookings/[id]/:path*",
    "/api/bids/:path*",
    "/api/rides/:path*",
    "/api/residents/:path*",
    "/api/incidents/:path*",
    "/api/onboarding/:path*",
    "/api/edit-details/:path*",
  ]
};