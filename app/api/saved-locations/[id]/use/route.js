import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Get current user's business
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    const location = await prisma.savedLocation.findUnique({
      where: { id },
      include: {
        user: {
          select: { businessId: true },
        },
      },
    });

    if (!location) {
      return Response.json({ error: "Location not found" }, { status: 404 });
    }

    // Check if location belongs to someone in the same business
    if (location.user.businessId !== user.businessId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedLocation = await prisma.savedLocation.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    return Response.json({ savedLocation: updatedLocation }, { status: 200 });
  } catch (error) {
    console.error("Error incrementing location use:", error);
    return Response.json({ error: "Failed to update location" }, { status: 500 });
  }
}