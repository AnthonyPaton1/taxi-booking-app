import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { houseId } = params;
    const { password } = await request.json();

    // Validation
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check house exists and belongs to this manager
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      select: { managerId: true },
    });

    if (!house) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    if (house.managerId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to manage this house" },
        { status: 403 }
      );
    }

    // Hash password and update
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.house.update({
      where: { id: houseId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating house password:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}