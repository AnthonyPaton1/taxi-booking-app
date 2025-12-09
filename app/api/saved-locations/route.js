//api/saved-locations/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

/**
 * GET /api/saved-locations
 * Fetches all saved locations for the authenticated user
 * Sorted by most frequently used
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user's business
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true, role: true },
    });

    if (!user?.businessId) {
      return Response.json({ savedLocations: [] }, { status: 200 });
    }

    // Fetch saved locations created by ANY coordinator in the same business
    const savedLocations = await prisma.savedLocation.findMany({
      where: {
        user: {
          businessId: user.businessId,
          role: "COORDINATOR",  // ← Only locations created by coordinators
        },
      },
      orderBy: [
        { useCount: 'desc' },
        { lastUsed: 'desc' },
        { name: 'asc' },
      ],
    });

    return Response.json({ savedLocations }, { status: 200 });

  } catch (error) {
    console.error("Error fetching saved locations:", error);
    return Response.json(
      { error: "Failed to fetch saved locations" },
      { status: 500 }
    );
  }
}
/**
 * POST /api/saved-locations
 * Creates a new saved location
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, address, postcode, notes } = await req.json();

    // Validate required fields
    if (!name || !address || !postcode) {
      return Response.json(
        { error: "Name, address, and postcode are required" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.savedLocation.findFirst({
      where: {
        userId: session.user.id,
        postcode: postcode.toUpperCase().replace(/\s/g, ''),
        name: name.trim(),
      },
    });

    if (existing) {
      return Response.json(
        { error: "This location is already saved" },
        { status: 400 }
      );
    }

    // Create saved location
    const savedLocation = await prisma.savedLocation.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        address: address.trim(),
        postcode: postcode.toUpperCase(),
        notes: notes?.trim() || null,
      },
    });

    return Response.json(
      { savedLocation, message: "Location saved successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating saved location:", error);
    return Response.json(
      { error: "Failed to save location" },
      { status: 500 }
    );
  }
}