// app/api/residents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { houseId, name, initials } = body;

    // Validation
    if (!houseId || !name || !initials) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the manager owns this house
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const house = await prisma.house.findUnique({
      where: { id: houseId },
    });

    if (!house || house.managerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "House not found or unauthorized" },
        { status: 403 }
      );
    }

    // Check for duplicate initials in this house
    const existingResident = await prisma.resident.findFirst({
      where: {
        houseId,
        initials: initials.toUpperCase(),
      },
    });

    if (existingResident) {
      return NextResponse.json(
        { success: false, error: "Initials already in use for this house" },
        { status: 400 }
      );
    }

    // Create the resident
    const resident = await prisma.resident.create({
      data: {
        houseId,
        name: name.trim(),
        initials: initials.trim().toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      resident,
    });
  } catch (error) {
    console.error("Error creating resident:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get("id");

    if (!residentId) {
      return NextResponse.json(
        { success: false, error: "Resident ID required" },
        { status: 400 }
      );
    }

    // Verify the manager owns the house this resident belongs to
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

    // Delete the resident (cascade will handle bookings)
    await prisma.resident.delete({
      where: { id: residentId },
    });

    return NextResponse.json({
      success: true,
      message: "Resident deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resident:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}