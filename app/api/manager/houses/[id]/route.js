// app/api/houses/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

// PUT - Update house
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: houseId } = await params;
    const body = await req.json();
    const { number, street, city, postcode, lat, lng } = body;

    // Verify the house belongs to this manager
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: { manager: true },
    });

    if (!house) {
      return NextResponse.json(
        { error: "House not found" },
        { status: 404 }
      );
    }

    if (house.manager.email !== session.user.email) {
      return NextResponse.json(
        { error: "You don't have permission to edit this house" },
        { status: 403 }
      );
    }

    // Update the house
    const updatedHouse = await prisma.house.update({
      where: { id: houseId },
      data: {
        number,
        street,
        city: city || null,
        postcode,
        lat,
        lng,
      },
    });

    return NextResponse.json({
      success: true,
      house: updatedHouse,
    });
    
  } catch (error) {
    console.error("Update house error:", error);
    return NextResponse.json(
      { error: "Failed to update house" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete house (tender lost scenario)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "COORDINATOR", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: houseId } = await params;

    // Get house with residents
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: {
        residents: true,
        manager: true,
      },
    });

    if (!house) {
      return NextResponse.json(
        { error: "House not found" },
        { status: 404 }
      );
    }

    // Verify permission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const canDelete = 
      (session.user.role === "MANAGER" && house.managerId === user.id) ||
      (session.user.role === "COORDINATOR" && house.areaId === user.areaId) ||
      (session.user.role === "ADMIN");

    if (!canDelete) {
      return NextResponse.json(
        { error: "You don't have permission to delete this house" },
        { status: 403 }
      );
    }

    // Check for active residents
    if (house.residents.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete house with ${house.residents.length} resident(s). Please remove or transfer residents first.`,
          residentsCount: house.residents.length,
        },
        { status: 400 }
      );
    }

    // Check for active/upcoming bookings
    const upcomingBookings = await prisma.advancedBooking.count({
      where: {
        createdById: house.managerId,
        pickupTime: { gte: new Date() },
        status: { in: ["OPEN", "ACCEPTED"] },
      },
    });

    if (upcomingBookings > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete house with ${upcomingBookings} upcoming booking(s). Cancel or complete bookings first.`,
          bookingsCount: upcomingBookings,
        },
        { status: 400 }
      );
    }

    // Soft delete the house
    const deletedHouse = await prisma.house.update({
      where: { id: houseId },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "House deleted successfully. It can be reclaimed if needed.",
      house: deletedHouse,
    });

  } catch (error) {
    console.error("Delete house error:", error);
    return NextResponse.json(
      { error: "Failed to delete house: " + error.message },
      { status: 500 }
    );
  }
}