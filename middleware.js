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
  "/house/dashboard": ["HOUSE_STAFF"],
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
  "/api/incidents": ["ADMIN", "MANAGER", "COORDINATOR", "DRIVER", "HOUSE_STAFF"],
  "/api/invite": roleAccess.admin,
  "/api/onboarding": ["ADMIN", "DRIVER", "MANAGER", "COORDINATOR"],
  "/api/edit-details": ["ADMIN", "COORDINATOR"],
  "/api/user": roleAccess.admin,
  "/api/super-admin": ["SUPER_ADMIN"], // ✅ Add super admin API protection
};

const DEBUG = process.env.NODE_ENV === 'development';

// ✅ Enhanced security headers for production launch
function applySecurityHeaders(response) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY', // Changed from SAMEORIGIN for better security
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://www.google.com https://res.cloudinary.com https://maps.googleapis.com",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'", // Changed from 'self' - prevents any framing
      "upgrade-insecure-requests"
    ].join('; '),
  };

  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Strict-Transport-Security'] = 
      'max-age=63072000; includeSubDomains; preload'; // 2 years instead of 1
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// ✅ Check if user is super admin
function isSuperAdmin(email, role) {
  const superAdminEmails = process.env.SUPER_ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
  return role === 'SUPER_ADMIN' || superAdminEmails.includes(email);
}

// ✅ Get default dashboard for role
function getRoleDashboard(role) {
  const dashboards = {
    'SUPER_ADMIN': '/dashboard/super-admin',
    'ADMIN': '/dashboard/admin',
    'MANAGER': '/dashboard/manager',
    'DRIVER': '/dashboard/driver',
    'COORDINATOR': '/dashboard/coordinator',
    'HOUSE_STAFF': '/house/dashboard',
  };
  return dashboards[role] || '/dashboard';
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api');
  const isHouseRoute = pathname.startsWith('/house');

  // Handle house routes with NextAuth
  if (isHouseRoute) {
    if (pathname === '/house/login') {
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "HOUSE_STAFF") {
      const response = NextResponse.redirect(new URL('/login', req.url));
      return applySecurityHeaders(response);
    }

    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Get token for user routes
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET
  });

  if (DEBUG) {
    console.log("🔍 Middleware:", pathname, "Token:", !!token, "Role:", token?.role);
  }
  
  if (isApiRoute) {
    // Handle house API routes
    if (pathname.startsWith('/api/house')) {
      const houseSession = req.cookies.get('house-session');
      
      if (pathname === '/api/house/login') {
        const response = NextResponse.next();
        return applySecurityHeaders(response);
      }

      if (!houseSession) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const response = NextResponse.next();
      return applySecurityHeaders(response);
    }

    // No token = return 401 JSON
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // ✅ Check if super admin - they have access to everything
    const userIsSuperAdmin = isSuperAdmin(token.email, token.role);

    // Check API route permissions
    for (const [routePrefix, allowedRoles] of Object.entries(protectedApiRoutes)) {
      if (pathname.startsWith(routePrefix)) {
        if (userIsSuperAdmin || allowedRoles.includes(token.role)) {
          const response = NextResponse.next();
          return applySecurityHeaders(response);
        }

        return new NextResponse(
          JSON.stringify({ success: false, error: 'Forbidden' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // DASHBOARD ROUTES: Redirect if not signed in
  if (!token) {
    const response = NextResponse.redirect(new URL("/api/auth/signin", req.url));
    return applySecurityHeaders(response);
  }

  // ✅ Check if super admin
  const userIsSuperAdmin = isSuperAdmin(token.email, token.role);

  // ✅ AUTO-REDIRECT: If accessing /dashboard root, redirect to appropriate dashboard
  if (pathname === '/dashboard') {
    const targetDashboard = getRoleDashboard(token.role);
    const response = NextResponse.redirect(new URL(targetDashboard, req.url));
    return applySecurityHeaders(response);
  }

  // ✅ SUPER ADMIN SPECIAL ACCESS: Can access any dashboard for testing/monitoring
  if (userIsSuperAdmin) {
    // Allow super admin to access any route without checks
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Onboarding checks (skip for super admin)
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
      if (allowedRoles.includes(token.role)) {
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
    "/house/:path*", 
    "/onboarding/driver",
    "/api/admin/:path*",
    "/api/coordinator/:path*",
    "/api/manager/:path*",
    "/api/driver/:path*",
    "/api/house/:path*", 
    "/api/super-admin/:path*", 
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