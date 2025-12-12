// app/actions/driver/getDriverBookings.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get driver's accepted bookings for today
 */
export async function getDriverBookingsForToday(driverId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        driverId: driverId,
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
        pickupTime: { gte: today, lt: tomorrow },
        deletedAt: null,
      },
      include: {
        accessibilityProfile: true,
        createdBy: {
          select: { name: true, phone: true, email: true },
        },
        acceptedBid: {
          select: { amountCents: true, message: true },
        },
      },
      orderBy: { pickupTime: "asc" },
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("❌ Error fetching driver bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all driver's upcoming bookings (next 7 days)
 */
export async function getDriverUpcomingBookings(driverId) {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const bookings = await prisma.booking.findMany({
      where: {
        driverId: driverId,
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
      bookings,
    };
  } catch (error) {
    console.error("❌ Error fetching upcoming bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get driver's completed bookings (for history/earnings)
 * ✅ OPTIMIZED: Accepts driverId instead of refetching
 */
export async function getDriverCompletedBookings(driverId, limit = 20) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        driverId: driverId,
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
      bookings,
    };
  } catch (error) {
    console.error("❌ Error fetching completed bookings:", error);
    return { success: false, error: error.message };
  }
}