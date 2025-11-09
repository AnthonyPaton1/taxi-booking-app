// app/actions/bookings/getBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { matchDriverToBookings } from "@/lib/matching/enhanced-matching-algorithm";


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
        accessibilityProfile: true,
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
        accessibilityProfile: true,
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
          orderBy: { amountCents: "asc" },
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
 * Get available instant bookings for DRIVERS (with matching)
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

    // Get pending instant bookings
    const allBookings = await prisma.instantBooking.findMany({
      where: {
        status: "PENDING",
        driverId: null,
        pickupTime: {
          gte: new Date(),
        },
     
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
      },
      orderBy: { pickupTime: "asc" },
    });

    console.log('Query returned:', allBookings.length, 'bookings');

    // Add coordinates to bookings
  const bookingsWithCoords = allBookings
  .filter(booking => booking.pickupLatitude && booking.pickupLongitude)
  .map(booking => ({
    ...booking,
    pickupLat: booking.pickupLatitude,
    pickupLng: booking.pickupLongitude,
  }));



    // Run matching algorithm
    const matches = matchDriverToBookings(driver, bookingsWithCoords);

    // Return only matched bookings
    const matchedBookings = matches.map(match => match.booking);

    return { 
      success: true, 
      bookings: matchedBookings, 
      driverProfile: driver 
    };
  } catch (error) {
    console.error("❌ Error fetching available bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get available advanced bookings for DRIVERS (with matching)
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

    // Get open advanced bookings
    const allBookings = await prisma.advancedBooking.findMany({
   where: {
    AND: [
      { status: "OPEN" },
      { 
        visibility: {
          in: ["PUBLIC", "PRIVATE_TO_COMPANY"],
        }
      },
      {
        OR: [
          { bidDeadline: { gte: new Date() } },
          { bidDeadline: null },
        ],
      },
    ],
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




   const bookingsWithCoords = allBookings
  .filter(booking => booking.pickupLatitude && booking.pickupLongitude)
  .map(booking => ({
    ...booking,
    pickupLat: booking.pickupLatitude,
    pickupLng: booking.pickupLongitude,
  }));

const matches = matchDriverToBookings(driver, bookingsWithCoords);


    // Return only matched bookings
    const matchedBookings = matches.map(match => match.booking);

    
    return { 
      success: true, 
      bookings: matchedBookings, 
      driverProfile: driver 
    };
  } catch (error) {
    console.error("❌ Error fetching available advanced bookings:", error);
    return { success: false, error: error.message };
  }
}