// app/api/admin/areas/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PATCH(req, props) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    const { id } = params;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Area name is required" },
        { status: 400 }
      );
    }

    // Check if another area with this name exists
    const existing = await prisma.area.findFirst({
      where: {
        name: name.trim(),
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An area with this name already exists" },
        { status: 400 }
      );
    }

    // Update the area
    await prisma.area.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating area:", error);
    return NextResponse.json(
      { error: "Failed to update area" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, props) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if area has any users or houses
    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            house: true, // ✅ Changed from houses to house
          },
        },
      },
    });

    if (!area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    if (area._count.users > 0 || area._count.house > 0) {
      return NextResponse.json(
        { error: "Cannot delete area with active coordinators or houses" },
        { status: 400 }
      );
    }

    // Delete the area
    await prisma.area.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting area:", error);
    return NextResponse.json(
      { error: "Failed to delete area" },
      { status: 500 }
    );
  }
}