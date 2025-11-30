// app/actions/driver/getDriverBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Get driver's accepted bookings for today
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

    // ✅ Get all bookings assigned to this driver for today (unified)
    const bookings = await prisma.booking.findMany({
      where: {
        driverId: user.driver.id,
        status: {
          in: ["ACCEPTED", "IN_PROGRESS"],
        },
        pickupTime: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
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
      bookings,  // ✅ Single array
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

    // ✅ Get all upcoming bookings (unified)
    const bookings = await prisma.booking.findMany({
      where: {
        driverId: user.driver.id,
        status: {
          in: ["ACCEPTED", "IN_PROGRESS"],
        },
        pickupTime: {
          gte: now,
          lte: nextWeek,
        },
        deletedAt: null,
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
      bookings,  // ✅ Single array
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

    // ✅ Get completed bookings (unified)
    const bookings = await prisma.booking.findMany({
      where: {
        driverId: user.driver.id,
        status: "COMPLETED",
        deletedAt: null,
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
      bookings,  // ✅ Single array
    };
  } catch (error) {
    console.error("❌ Error fetching completed bookings:", error);
    return { success: false, error: error.message };
  }
}