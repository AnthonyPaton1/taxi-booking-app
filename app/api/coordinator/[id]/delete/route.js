// app/api/coordinator/[id]/delete/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

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

    const { id: managerId } = await params;

    console.log('🗑️ DELETE request for manager:', managerId);

    // Get the coordinator's user data
    const coordinator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { areaId: true },
    });

    // Get the manager - use findUnique to get by exact ID
    const manager = await prisma.user.findUnique({
      where: {
        id: managerId,
      },
      include: {
        houses: true,
      },
    });

    console.log('📋 Manager lookup result:', {
      found: !!manager,
      role: manager?.role,
      deletedAt: manager?.deletedAt,
      areaId: manager?.areaId,
      housesCount: manager?.houses?.length,
      coordinatorArea: coordinator?.areaId
    });

    // Check if manager exists
    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 }
      );
    }

    // Check if already deleted
    if (manager.deletedAt !== null) {
      return NextResponse.json(
        { success: false, error: "Manager already deleted" },
        { status: 400 }
      );
    }

    // Check if user is actually a manager
    if (manager.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: `User is not a manager (role: ${manager.role})` },
        { status: 400 }
      );
    }

    // Coordinators can only delete managers in their area, admins can delete anyone
    if (
      session.user.role === "COORDINATOR" &&
      manager.areaId !== coordinator.areaId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this manager (different area)" },
        { status: 403 }
      );
    }

    // Check if manager has houses
    if (manager.houses && manager.houses.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete manager with ${manager.houses.length} house(s). Please reassign houses first via the Houses page.`,
        },
        { status: 400 }
      );
    }

    // Soft delete the manager
    await prisma.user.update({
      where: { id: managerId },
      data: { deletedAt: new Date() },
    });

    console.log('✅ Manager deleted successfully:', managerId);

    return NextResponse.json({
      success: true,
      message: "Manager deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting manager:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}