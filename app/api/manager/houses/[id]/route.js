import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

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