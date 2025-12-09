//api/saved-locations/[id]/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/saved-locations/[id]
 * Updates a saved location
 */
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { name, address, postcode, notes } = await req.json();

    // Verify ownership
    const location = await prisma.savedLocation.findUnique({
      where: { id },
    });

    if (!location) {
      return Response.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (location.userId !== session.user.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update location
    const updatedLocation = await prisma.savedLocation.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(address && { address: address.trim() }),
        ...(postcode && { postcode: postcode.toUpperCase() }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    });

    return Response.json(
      { savedLocation: updatedLocation, message: "Location updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating saved location:", error);
    return Response.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-locations/[id]
 * Deletes a saved location
 */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verify ownership
    const location = await prisma.savedLocation.findUnique({
      where: { id },
    });

    if (!location) {
      return Response.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (location.userId !== session.user.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete location
    await prisma.savedLocation.delete({
      where: { id },
    });

    return Response.json(
      { message: "Location deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting saved location:", error);
    return Response.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-locations/[id]/use
 * Increments use count when a saved location is used in a booking
 */
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verify ownership and update
    const location = await prisma.savedLocation.findUnique({
      where: { id },
    });

    if (!location || location.userId !== session.user.id) {
      return Response.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const updatedLocation = await prisma.savedLocation.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    return Response.json(
      { savedLocation: updatedLocation },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error incrementing location use:", error);
    return Response.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}