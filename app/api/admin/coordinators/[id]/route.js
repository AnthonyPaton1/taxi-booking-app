// app/api/admin/coordinators/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, area } = await req.json();
    const { id } = params;

    // Get the membership to find the user
    const membership = await prisma.businessMembership.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!membership || membership.role !== "COORDINATOR") {
      return NextResponse.json(
        { error: "Coordinator not found" },
        { status: 404 }
      );
    }

    // Create or get the area
    const areaRecord = await prisma.area.upsert({
      where: { name: area.trim() },
      update: {},
      create: { name: area.trim() },
    });

    // Update the user
    await prisma.user.update({
      where: { id: membership.userId },
      data: {
        name,
        phone: phone || null,
        areaId: areaRecord.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating coordinator:", error);
    return NextResponse.json(
      { error: "Failed to update coordinator" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get the membership
    const membership = await prisma.businessMembership.findUnique({
      where: { id },
    });

    if (!membership || membership.role !== "COORDINATOR") {
      return NextResponse.json(
        { error: "Coordinator not found" },
        { status: 404 }
      );
    }

    // Delete the membership (keeps user account but removes coordinator role)
    await prisma.businessMembership.delete({
      where: { id },
    });

    // Optionally update user role if they have no other memberships
    const remainingMemberships = await prisma.businessMembership.count({
      where: { userId: membership.userId },
    });

    if (remainingMemberships === 0) {
      await prisma.user.update({
        where: { id: membership.userId },
        data: {
          role: "PUBLIC",
          coordinatorOnboarded: false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coordinator:", error);
    return NextResponse.json(
      { error: "Failed to delete coordinator" },
      { status: 500 }
    );
  }
}