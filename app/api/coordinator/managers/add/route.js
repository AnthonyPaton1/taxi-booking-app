// app/api/coordinator/managers/add/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, name, email, phone, houseIds, area } = await req.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Get or create area
    let areaRecord = null;
    if (area) {
      areaRecord = await prisma.area.upsert({
        where: { name: area.trim() },
        update: {},
        create: { name: area.trim() },
      });
    }

    // Create the manager user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        role: "MANAGER",
        businessId,
        areaId: areaRecord?.id,
      },
    });

    // Link manager to houses (if any selected)
    if (houseIds && houseIds.length > 0) {
      await prisma.house.updateMany({
        where: {
          id: { in: houseIds },
        },
        data: {
          managerId: user.id,
        },
      });
    }

    // Create business membership
    await prisma.businessMembership.create({
      data: {
        userId: user.id,
        businessId,
        role: "MANAGER",
      },
    });

    // Send invitation email (with 3 second delay to avoid rate limiting)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    await inviteUserToLogin({
      email,
      name,
      role: "MANAGER",
    });

    return NextResponse.json({
      success: true,
      managerId: user.id,
    });
  } catch (error) {
    console.error("Error adding manager:", error);
    return NextResponse.json(
      { error: "Failed to add manager" },
      { status: 500 }
    );
  }
}