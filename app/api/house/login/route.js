// app/api/house/login/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { loginName, password } = body;

    // Validation
    if (!loginName || !password) {
      return NextResponse.json(
        { error: "Login name and password are required" },
        { status: 400 }
      );
    }

    // Find house by loginName
    const house = await prisma.house.findUnique({
      where: { 
        loginName: loginName.trim(),
        deletedAt: null, // Don't allow login to deleted houses
      },
      select: {
        id: true,
        password: true,
        label: true,
        businessId: true,
      },
    });

    if (!house) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // Check if password is set
    if (!house.password) {
      return NextResponse.json(
        { error: "House password not set. Please contact your manager." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, house.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Create session in database
    await prisma.houseSession.create({
      data: {
        token: sessionToken,
        houseId: house.id,
        expiresAt,
      },
    });

    // Set cookie
  const cookieStore = await cookies(); 
cookieStore.set("house-session", sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: expiresAt,
  path: "/",
});

    return NextResponse.json({
      success: true,
      house: {
        id: house.id,
        label: house.label,
      },
    });
  } catch (error) {
    console.error("House login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}