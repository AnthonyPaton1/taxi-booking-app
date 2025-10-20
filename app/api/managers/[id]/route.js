// app/api/managers/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
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

    const { id: managerId } = params;
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

// DELETE - Delete manager
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Only coordinators and admins can delete managers
    if (
      !session ||
      !["COORDINATOR", "ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: managerId } = params;

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
      include: {
        houses: true,
      },
    });

    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 }
      );
    }

    // Coordinators can only delete managers in their area, admins can delete anyone
    if (
      session.user.role === "COORDINATOR" &&
      manager.areaId !== coordinator.areaId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this manager" },
        { status: 403 }
      );
    }

    // Check if manager has houses
    if (manager.houses.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete manager with ${manager.houses.length} house(s). Please reassign or delete houses first.`,
        },
        { status: 400 }
      );
    }

    // Delete the manager
    await prisma.user.delete({
      where: { id: managerId },
    });

    return NextResponse.json({
      success: true,
      message: "Manager deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting manager:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}