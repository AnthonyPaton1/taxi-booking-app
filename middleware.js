import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token.isApproved) {
    return NextResponse.redirect(new URL("/waiting-approval", req.url));
  }

  if (token.role === "DRIVER" && !pathname.startsWith("/dashboard/driver")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (
    ["MANAGER", "ADMIN"].includes(token.role) &&
    !pathname.startsWith("/dashboard/manager")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (
    token.role === "SUPER-ADMIN" &&
    !pathname.startsWith("/dashboard/admin")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"], // ✅ VALID
};
