// app/actions/bookings/getBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get instant bookings for current user
 * (Public users see their own bookings)
 */
export async function getInstantBookings() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const bookings = await prisma.instantBooking.findMany({
      where: { createdById: session.user.id },
      include: {
        accessibilityProfile: true, // ✅ Include accessibility needs
        driver: {
          select: {
            name: true,
            phone: true,
            vehicleType: true,
            vehicleReg: true,
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("❌ Error fetching instant bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get advanced bookings for current user
 * (Public users see their own bookings with bids)
 */
export async function getAdvancedBookings() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const bookings = await prisma.advancedBooking.findMany({
      where: { createdById: session.user.id },
      include: {
        accessibilityProfile: true, // ✅ Include accessibility needs
        bids: {
          include: {
            driver: {
              select: {
                name: true,
                phone: true,
                vehicleType: true,
                vehicleReg: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { amountCents: "asc" }, // Lowest bid first
        },
        acceptedBid: {
          include: {
            driver: {
              select: {
                name: true,
                phone: true,
                vehicleType: true,
              },
            },
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("❌ Error fetching advanced bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get available instant bookings for DRIVERS
 * (Shows pending bookings they could accept)
 */
export async function getAvailableInstantBookings() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get driver profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        driver: {
          include: {
            accessibilityProfile: true,
          },
        },
      },
    });

    if (!user?.driver) {
      return { success: false, error: "No driver profile found" };
    }

    // Get pending instant bookings
    const bookings = await prisma.instantBooking.findMany({
      where: {
        status: "PENDING",
        pickupTime: {
          gte: new Date(), // Future bookings only
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    // TODO: Filter by matching accessibility (implement matching algorithm)
    // For now, return all pending bookings

    return { success: true, bookings, driverProfile: user.driver };
  } catch (error) {
    console.error("❌ Error fetching available bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get available advanced bookings for DRIVERS
 * (Shows open bookings they could bid on)
 */
export async function getAvailableAdvancedBookings() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get driver profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        driver: {
          include: {
            accessibilityProfile: true,
          },
        },
      },
    });

    if (!user?.driver) {
      return { success: false, error: "No driver profile found" };
    }

    // Get open advanced bookings (still accepting bids)
    const bookings = await prisma.advancedBooking.findMany({
      where: {
        status: "OPEN",
        pickupTime: {
          gte: new Date(), // Future bookings only
        },
        bidDeadline: {
          gte: new Date(), // Deadline hasn't passed
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        bids: {
          where: {
            userId: session.user.id, // Show if driver already bid
          },
          select: {
            id: true,
            amountCents: true,
            status: true,
          },
        },
        _count: {
          select: {
            bids: true, // Total number of bids
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    // TODO: Filter by matching accessibility

    return { success: true, bookings, driverProfile: user.driver };
  } catch (error) {
    console.error("❌ Error fetching available advanced bookings:", error);
    return { success: false, error: error.message };
  }
}