// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { roleAccess } from "@/lib/roles";
// REMOVED: Rate limiting doesn't work in Edge Runtime
// import { rateLimit, getClientIp } from "@/lib/rateLimit";

const protectedRoutes = {
  "/dashboard/admin": roleAccess.admin,
  "/dashboard/manager": roleAccess.manager,
  "/dashboard/driver": roleAccess.driver,
  "/dashboard/coordinator": roleAccess.coordinator,
  "/dashboard/public": roleAccess.public,
  "/dashboard/super-admin": ["SUPER_ADMIN"]
};

// Add API route protection
const protectedApiRoutes = {
  "/api/admin": roleAccess.admin,
  "/api/coordinator": roleAccess.coordinator,
  "/api/manager": roleAccess.manager,
  "/api/driver": roleAccess.driver,
  "/api/bookings": ["ADMIN", "MANAGER", "COORDINATOR"],
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
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api');

  // Get token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET
  });

  if (DEBUG) {
    console.log("🔍 Middleware:", pathname, "Token:", !!token, "Role:", token?.role);
  }

  // NOTE: Rate limiting is now handled in individual API routes with Redis
  // Middleware runs on Edge Runtime which doesn't support Redis/ioredis
  
  if (isApiRoute) {
    // No token = return 401 JSON (don't redirect)
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check API route permissions
    for (const [routePrefix, allowedRoles] of Object.entries(protectedApiRoutes)) {
      if (pathname.startsWith(routePrefix)) {
        if (token.role === "SUPER_ADMIN" || allowedRoles.includes(token.role)) {
          const response = NextResponse.next();
          return applySecurityHeaders(response);
        }

        // Not allowed = return 403 JSON
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Forbidden' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // API route not in protected list = allow through
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // DASHBOARD ROUTES: Redirect if not signed in
  if (!token) {
    const response = NextResponse.redirect(new URL("/api/auth/signin", req.url));
    return applySecurityHeaders(response);
  }

  // Onboarding checks
  const needsDriverOnboarding = token.role === "DRIVER" && !token.driverOnboarded;
  const needsAdminOnboarding = token.role === "ADMIN" && !token.adminOnboarded;

  if (needsDriverOnboarding && !pathname.startsWith("/dashboard/driver")) {
    const response = NextResponse.redirect(new URL("/dashboard/driver", req.url));
    return applySecurityHeaders(response);
  }

  if (needsAdminOnboarding && !pathname.startsWith("/dashboard/admin")) {
    const response = NextResponse.redirect(new URL("/dashboard/admin", req.url));
    return applySecurityHeaders(response);
  }

  // Check protected dashboard routes
  for (const [routePrefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (token.role === "SUPER_ADMIN" || allowedRoles.includes(token.role)) {
        const response = NextResponse.next();
        return applySecurityHeaders(response);
      }

      const response = NextResponse.redirect(new URL("/unauthorised", req.url));
      return applySecurityHeaders(response);
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