// app/api/admin/coordinators/add/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, name, email, phone, area } = await req.json();

    // Validate required fields
    if (!name || !email || !area) {
      return NextResponse.json(
        { error: "Name, email, and area are required" },
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

    // Create or get the area
    const areaRecord = await prisma.area.upsert({
      where: { name: area.trim() },
      update: {},
      create: { name: area.trim() },
    });

    // Create the coordinator user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        role: "COORDINATOR",
        businessId,
        areaId: areaRecord.id,
      },
    });

    // Create business membership
    await prisma.businessMembership.create({
      data: {
        userId: user.id,
        businessId,
        role: "COORDINATOR",
      },
    });

    // Send invitation email
    await inviteUserToLogin({
      email,
      name,
      role: "COORDINATOR",
    });

    return NextResponse.json({
      success: true,
      coordinatorId: user.id,
    });
  } catch (error) {
    console.error("Error adding coordinator:", error);
    return NextResponse.json(
      { error: "Failed to add coordinator" },
      { status: 500 }
    );
  }
}