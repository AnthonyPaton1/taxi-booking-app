// app/api/manager/houses/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      label,
      line1,
      city,
      postcode,
      notes,
      lat,
      lng,
      businessId,
      managerId,
      areaId,
    } = body;

    // Validate required fields
    if (!label || !line1 || !city || !postcode || !lat || !lng) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify manager owns this business
    const manager = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (manager.businessId !== businessId) {
      return NextResponse.json(
        { error: "You can only add houses to your own business" },
        { status: 403 }
      );
    }

    // Create the house
    const house = await prisma.house.create({
      data: {
        label,
        line1,
        city,
        postcode,
        notes: notes || null,
        lat,
        lng,
        internalId: `house-${Math.random().toString(36).slice(2, 8)}`,
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        loginName: `login-${Math.random().toString(36).slice(2, 6)}`,
        manager: { connect: { id: managerId } },
        business: { connect: { id: businessId } },
        area: { connect: { id: areaId } },
      },
    });

    return NextResponse.json(
      { success: true, house },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating house:", error);
    return NextResponse.json(
      { error: "Failed to create house" },
      { status: 500 }
    );
  }
}