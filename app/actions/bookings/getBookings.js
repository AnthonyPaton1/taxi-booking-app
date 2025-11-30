// app/actions/bookings/getBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
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
        driver: {  // Direct driver assignment (if no bidding)
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
 * Shows ALL bookings they can bid on (regardless of pickup time)
 */
export async function getAvailableBookings() {
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

    const driver = user.driver;

    // Check if driver has location set
    if (!driver.baseLat || !driver.baseLng) {
      return { 
        success: true, 
        bookings: [], 
        driverProfile: driver,
        error: "Driver location not set" 
      };
    }

    // Get all PENDING bookings (available for bidding)
    const allBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",  // ✅ New unified status
        visibility: {
          in: ["PUBLIC", "PRIVATE_TO_COMPANY"],
        },
        pickupTime: {
          gte: new Date(),  // Only future bookings
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
            userId: session.user.id,
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

    // Filter bookings with valid coordinates
    const bookingsWithCoords = allBookings
      .filter(booking => booking.pickupLatitude && booking.pickupLongitude)
      .map(booking => ({
        ...booking,
        pickupLat: booking.pickupLatitude,
        pickupLng: booking.pickupLongitude,
      }));

    // Run matching algorithm
    const matches = await matchDriverToBookingsCached(driver, bookingsWithCoords);

    if (!matches || !Array.isArray(matches)) {
      return { success: true, bookings: [], count: 0 };
    }

    const matchedBookings = matches.map(match => match.booking);

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