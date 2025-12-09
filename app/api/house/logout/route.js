// app/api/house/logout/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("house-session")?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.houseSession.deleteMany({
        where: { token: sessionToken },
      });
    }

    // Clear cookie
    cookieStore.delete("house-session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("House logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}