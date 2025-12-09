// app/api/coordinator/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// PATCH - Update manager
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Only coordinators and admins can edit managers
    if (
      !session ||
      !["COORDINATOR", "ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: managerId } = await params; // ✅ AWAIT PARAMS
    const body = await request.json();
    const { name, email, phone } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get the coordinator's user data
    const coordinator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { areaId: true },
    });

    // Get the manager and verify they're in the coordinator's area
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "MANAGER",
      },
    });

    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 }
      );
    }

    // Coordinators can only edit managers in their area, admins can edit anyone
    if (
      session.user.role === "COORDINATOR" &&
      manager.areaId !== coordinator.areaId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to edit this manager" },
        { status: 403 }
      );
    }

    // Check if email is already taken by another user
    if (email !== manager.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update the manager
    const updatedManager = await prisma.user.update({
      where: { id: managerId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      manager: updatedManager,
    });
  } catch (error) {
    console.error("Error updating manager:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

