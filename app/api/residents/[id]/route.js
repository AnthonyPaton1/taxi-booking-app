// app/api/residents/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: residentId } = params;
    const body = await request.json();
    const { name, initials } = body;

    // Validation
    if (!name || !initials) {
      return NextResponse.json(
        { success: false, error: "Name and initials are required" },
        { status: 400 }
      );
    }

    // Get the resident and verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: { house: true },
    });

    if (!resident || resident.house.managerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Resident not found or unauthorized" },
        { status: 403 }
      );
    }

    // Check for duplicate initials in the same house (excluding current resident)
    const duplicate = await prisma.resident.findFirst({
      where: {
        houseId: resident.houseId,
        initials: initials.toUpperCase(),
        NOT: {
          id: residentId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Initials already in use for this house" },
        { status: 400 }
      );
    }

    // Update the resident
    const updatedResident = await prisma.resident.update({
      where: { id: residentId },
      data: {
        name: name.trim(),
        initials: initials.trim().toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      resident: updatedResident,
    });
  } catch (error) {
    console.error("Error updating resident:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}