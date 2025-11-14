// app/api/auth/set-password/route.js
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    // RATE LIMITING
    const ip = getClientIp(req);
    const rateLimitResult = await rateLimit(
      `set_password:${ip}`,
      RATE_LIMITS.PASSWORD_RESET.limit,
      RATE_LIMITS.PASSWORD_RESET.window
    );

    if (rateLimitResult && !rateLimitResult.success) {
  return NextResponse.json(
    { 
      message: "Too many password attempts. Please try again later.",
      retryAfter: rateLimitResult.retryAfter 
    },
    { status: 429 }
  );
}

    const { token, password } = await req.json();

    // Validate password strength
    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const reset = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashed },
    });

    const user = await prisma.user.findUnique({
      where: { id: reset.userId },
      select: { email: true, role: true },
    });

    if (!user?.email || !user?.role) {
      return NextResponse.json(
        { message: "User not found after password reset." },
        { status: 500 }
      );
    }

    await prisma.passwordResetToken.delete({ where: { id: reset.id } });

    return NextResponse.json({
      message: "Password set successfully.",
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}