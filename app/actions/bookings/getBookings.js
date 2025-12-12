// app/actions/bookings/getBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { matchDriverToBookingsCached } from "@/lib/matching/cached-matching-algorithm";

/**
 * Get all bookings for current user
 * (Shows their booking history with bids/driver info)
 */
export async function getMyBookings() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const bookings = await prisma.booking.findMany({
      where: { 
        createdById: session.user.id,
        deletedAt: null,
      },
      include: {
        accessibilityProfile: true,
        bids: {
          include: {
            driver: {
              select: {
                name: true,
                phone: true,
                vehicleClass: true,
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
          orderBy: { amountCents: "asc" },
        },
        acceptedBid: {
          include: {
            driver: {
              select: {
                name: true,
                phone: true,
                vehicleClass: true,
                vehicleReg: true,
              },
            },
          },
        },
        driver: {
          select: {
            name: true,
            phone: true,
            vehicleClass: true,
            vehicleReg: true,
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get available bookings for DRIVERS (with matching)
 * ✅ OPTIMIZED: Accepts driver object instead of refetching
 */
export async function getAvailableBookings(driver, userId) {
  try {
    if (!driver) {
      return { success: false, error: "No driver profile provided" };
    }

    if (!driver.baseLat || !driver.baseLng) {
      return { 
        success: true, 
        bookings: [], 
        driverProfile: driver,
        error: "Driver location not set" 
      };
    }

    const allBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        visibility: {
          in: ["PUBLIC", "PRIVATE_TO_COMPANY"],
        },
        pickupTime: {
          gte: new Date(),
        },
        deletedAt: null,
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: {
            name: true,
            business: {
              select: {
                name: true,
                lat: true,
                lng: true,
              },
            },
          },
        },
        bids: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
            amountCents: true,
            status: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    const bookingsWithCoords = allBookings
      .filter(booking => booking.pickupLatitude && booking.pickupLongitude)
      .map(booking => ({
        ...booking,
        pickupLat: booking.pickupLatitude,
        pickupLng: booking.pickupLongitude,
      }));

    const matches = await matchDriverToBookingsCached(driver, bookingsWithCoords);

    if (!matches || !Array.isArray(matches)) {
      return { success: true, bookings: [], count: 0 };
    }

    // ✅ ADD matchScore and distance to each booking
    const matchedBookings = matches.map(match => ({
      ...match.booking,
      matchScore: match.score,      
      distance: match.distance,     
    }));

    console.log(`✅ Matched ${matchedBookings.length} bookings for driver`);

    return { 
      success: true, 
      bookings: matchedBookings,
      count: matchedBookings.length,
      driverProfile: driver 
    };
  } catch (error) {
    console.error("❌ Error fetching available bookings:", error);
    return { success: false, error: error.message };
  }
}