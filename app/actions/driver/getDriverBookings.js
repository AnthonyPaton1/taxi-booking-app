// app/actions/driver/getDriverBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Get driver's accepted instant bookings for today
 */
export async function getDriverBookingsForToday() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Get driver profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { driver: true },
    });

    if (!user?.driver) {
      console.warn("Driver not found for user:", session.user.id);
      return { success: true, bookings: [] };
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get instant bookings assigned to this driver for today
    const instantBookings = await prisma.instantBooking.findMany({
      where: {
        driverId: user.driver.id,
        status: {
          in: ["ACCEPTED", "IN_PROGRESS"], // Exclude completed/cancelled
        },
        pickupTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    // Get advanced bookings this driver won for today
    const advancedBookings = await prisma.advancedBooking.findMany({
      where: {
        status: "ACCEPTED",
        acceptedBid: {
          driverId: user.driver.id,
        },
        pickupTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        acceptedBid: {
          select: {
            amountCents: true,
            message: true,
          },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    return {
      success: true,
      instant: instantBookings,
      advanced: advancedBookings,
    };
  } catch (error) {
    console.error("❌ Error fetching driver bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all driver's upcoming bookings (next 7 days)
 */
export async function getDriverUpcomingBookings() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { driver: true },
    });

    if (!user?.driver) {
      return { success: true, bookings: [] };
    }

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // Instant bookings
    const instantBookings = await prisma.instantBooking.findMany({
      where: {
        driverId: user.driver.id,
        status: {
          in: ["ACCEPTED", "IN_PROGRESS"],
        },
        pickupTime: {
          gte: now,
          lte: nextWeek,
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    // Advanced bookings
    const advancedBookings = await prisma.advancedBooking.findMany({
      where: {
        status: "ACCEPTED",
        acceptedBid: {
          driverId: user.driver.id,
        },
        pickupTime: {
          gte: now,
          lte: nextWeek,
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: { name: true, phone: true },
        },
        acceptedBid: {
          select: { amountCents: true },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    return {
      success: true,
      instant: instantBookings,
      advanced: advancedBookings,
    };
  } catch (error) {
    console.error("❌ Error fetching upcoming bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get driver's completed bookings (for history/earnings)
 */
export async function getDriverCompletedBookings(limit = 20) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { driver: true },
    });

    if (!user?.driver) {
      return { success: true, bookings: [] };
    }

    const instantBookings = await prisma.instantBooking.findMany({
      where: {
        driverId: user.driver.id,
        status: "COMPLETED",
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { pickupTime: "desc" },
      take: limit,
    });

    const advancedBookings = await prisma.advancedBooking.findMany({
      where: {
        status: "COMPLETED",
        acceptedBid: {
          driverId: user.driver.id,
        },
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: { name: true },
        },
        acceptedBid: {
          select: { amountCents: true },
        },
      },
      orderBy: { pickupTime: "desc" },
      take: limit,
    });

    return {
      success: true,
      instant: instantBookings,
      advanced: advancedBookings,
    };
  } catch (error) {
    console.error("❌ Error fetching completed bookings:", error);
    return { success: false, error: error.message };
  }
}