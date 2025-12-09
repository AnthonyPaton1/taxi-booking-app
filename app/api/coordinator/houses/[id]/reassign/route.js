// app/api/coordinator/houses/[id]/reassign/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["COORDINATOR", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: houseId } = await params;
    const { newManagerId } = await request.json();

    if (!newManagerId) {
      return NextResponse.json(
        { success: false, error: "New manager ID required" },
        { status: 400 }
      );
    }

    // Get coordinator's area
    const coordinator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { areaId: true },
    });

    // Verify house exists and is in coordinator's area
    const house = await prisma.house.findFirst({
      where: {
        id: houseId,
        areaId: coordinator.areaId,
        deletedAt: null,
      },
    });

    if (!house) {
      return NextResponse.json(
        { success: false, error: "House not found or not in your area" },
        { status: 404 }
      );
    }

    // Verify new manager exists and is in same area
    const newManager = await prisma.user.findFirst({
      where: {
        id: newManagerId,
        role: "MANAGER",
        areaId: coordinator.areaId,
        deletedAt: null,
      },
    });

    if (!newManager) {
      return NextResponse.json(
        { success: false, error: "New manager not found or not in your area" },
        { status: 404 }
      );
    }

    // Update house manager
    const updatedHouse = await prisma.house.update({
      where: { id: houseId },
      data: {
        managerId: newManagerId,
      },
      include: {
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `House reassigned to ${updatedHouse.manager.name}`,
      house: updatedHouse,
    });
  } catch (error) {
    console.error("Error reassigning house:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}