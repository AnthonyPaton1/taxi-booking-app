// app/actions/driver/getMatchedBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { matchDriverToBookingsCached } from "@/lib/matching/bookingMatcher";

/**
 * Get all available advanced bookings that match this driver's capabilities
 * Used on the driver's "Available Bookings" page
 */
export async function getMatchedAdvancedBookingsForDriver() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "DRIVER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Get the driver's profile with accessibility capabilities
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
      include: {
        accessibilityProfile: true,
      },
    });

    if (!driver || !driver.approved) {
      return {
        success: false,
        error: "Driver profile not found or not approved",
      };
    }

    if (!driver.baseLat || !driver.baseLng) {
      return {
        success: false,
        error: "Driver location not set. Please update your profile with a valid postcode.",
      };
    }

    // 2. Get all open advanced bookings that haven't been accepted yet
    const availableBookings = await prisma.advancedBooking.findMany({
      where: {
        status: "OPEN",
        deletedAt: null,
        acceptedBidId: null,
        bidDeadline: {
          gte: new Date(), // Only bookings with future bid deadlines
        },
        
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: { name: true, email: true },
        },
        business: {
          select: { name: true, lat: true, lng: true },
        },
        bids: {
          where: { userId: session.user.id },
          select: { id: true, amountCents: true, status: true },
        },
      },
      orderBy: {
        pickupTime: "asc",
      },
    });

    // Add coordinates to bookings (using business location as approximation for now)
    const bookingsWithCoords = availableBookings.map(booking => ({
      ...booking,
      pickupLat: booking.business?.lat || 0,
      pickupLng: booking.business?.lng || 0,
    }));

    // 3. Match driver to bookings using the algorithm
    const matches = matchDriverToBookingsCached(driver, bookingsWithCoords, {
      maxDistance: driver.radiusMiles,
    });

    // 4. Format results for the UI
    const formattedMatches = matches.map(match => ({
      booking: {
        id: match.booking.id,
        pickupTime: match.booking.pickupTime,
        returnTime: match.booking.returnTime,
        pickupLocation: match.booking.pickupLocation,
        dropoffLocation: match.booking.dropoffLocation,
        businessName: match.booking.business?.name,
        initials: match.booking.initials,
        bidDeadline: match.booking.bidDeadline,
        status: match.booking.status,
        visibility: match.booking.visibility,
        // Check if driver already bid
        hasUserBid: match.booking.bids.length > 0,
        userBid: match.booking.bids[0] || null,
      },
      matchDetails: {
        distance: match.distance,
        estimatedPickupMinutes: match.estimatedPickupMinutes,
        overallScore: match.overallScore,
        accessibilityCompatibility: match.accessibilityMatch.compatibilityScore,
        missingPreferences: match.accessibilityMatch.missingPreferences,
      },
    }));

    return {
      success: true,
      matches: formattedMatches,
      driverInfo: {
        name: driver.name,
        radiusMiles: driver.radiusMiles,
        basePostcode: driver.localPostcode,
      },
    };
  } catch (error) {
    console.error("Error matching bookings to driver:", error);
    return {
      success: false,
      error: "Failed to load available bookings",
    };
  }
}

/**
 * Get all available instant bookings for a driver
 * Instant bookings are auto-assigned, but we can show drivers what's pending
 */
export async function getMatchedInstantBookingsForDriver() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "DRIVER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
      include: {
        accessibilityProfile: true,
      },
    });

    if (!driver || !driver.approved) {
      return { success: false, error: "Driver not found or not approved" };
    }

    if (!driver.baseLat || !driver.baseLng) {
      return {
        success: false,
        error: "Driver location not set",
      };
    }

    // Get pending instant bookings (not yet assigned to anyone)
    const pendingBookings = await prisma.instantBooking.findMany({
      where: {
        status: "PENDING",
        driverId: null,
        pickupTime: {
          gte: new Date(), // Future pickups only
        },
      },
      include: {
        accessibilityProfile: true,
        business: {
          select: { name: true, lat: true, lng: true },
        },
      },
      orderBy: {
        pickupTime: "asc",
      },
    });

    const bookingsWithCoords = pendingBookings.map(booking => ({
      ...booking,
      pickupLat: booking.business?.lat || 0,
      pickupLng: booking.business?.lng || 0,
    }));

    // Match driver to instant bookings
    const matches = matchDriverToBookingsCached(driver, bookingsWithCoords);

    const formattedMatches = matches.map(match => ({
      booking: {
        id: match.booking.id,
        pickupTime: match.booking.pickupTime,
        returnTime: match.booking.returnTime,
        pickupLocation: match.booking.pickupLocation,
        dropoffLocation: match.booking.dropoffLocation,
        businessName: match.booking.business?.name,
        initials: match.booking.initials,
        estimatedCostPence: match.booking.estimatedCostPence,
        status: match.booking.status,
      },
      matchDetails: {
        distance: match.distance,
        estimatedPickupMinutes: match.estimatedPickupMinutes,
        overallScore: match.overallScore,
        accessibilityCompatibility: match.accessibilityMatch.compatibilityScore,
      },
    }));

    return {
      success: true,
      matches: formattedMatches,
    };
  } catch (error) {
    console.error("Error matching instant bookings:", error);
    return { success: false, error: "Failed to load instant bookings" };
  }
}