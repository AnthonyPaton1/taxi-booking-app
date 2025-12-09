// app/api/admin/managers/route.js is for the add manager role bypassing the coordinator for single property businesses
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, areaId, businessId } = body;

    // Validation
    if (!name || !email || !phone || !areaId) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Verify area exists
    const area = await prisma.area.findUnique({
      where: { id: areaId },
    });

    if (!area) {
      return NextResponse.json(
        { success: false, error: "Invalid area selected" },
        { status: 400 }
      );
    }

    // Create the manager user
    const manager = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone.trim(),
        role: "MANAGER",
        businessId: businessId,
        areaId: areaId,
        managerOnboarded: false,
      },
    });

    // Create business membership
    await prisma.businessMembership.create({
      data: {
        userId: manager.id,
        businessId: businessId,
        role: "MANAGER",
      },
    });

    // Send invitation email
    await inviteUserToLogin({
      email: manager.email,
      name: manager.name,
      role: "MANAGER",
    });

    return NextResponse.json({
      success: true,
      manager: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
      },
      message: "Manager added successfully and invitation sent",
    });
  } catch (error) {
    console.error("Error adding manager:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}