// app/actions/driver/getDriverProfile.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

/**
 * Get complete driver profile with all relations
 */
export async function getDriverProfile() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        driver: {
          include: {
            accessibilityProfile: true,
            compliance: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.driver) {
      return { success: true, hasDriver: false, user };
    }

    return {
      success: true,
      hasDriver: true,
      user,
      driver: user.driver,
      accessibilityProfile: user.driver.accessibilityProfile,
      compliance: user.driver.compliance,
    };
  } catch (error) {
    console.error("❌ Error fetching driver profile:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get driver statistics (for dashboard)
 */
export async function getDriverStats() {
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
      return {
        success: true,
        stats: {
          todaysJobs: 0,
          upcomingJobs: 0,
          completedJobs: 0,
          totalEarnings: 0,
        },
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Count today's jobs
    const todaysInstant = await prisma.instantBooking.count({
      where: {
        driverId: user.driver.id,
        pickupTime: { gte: today, lt: tomorrow },
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
      },
    });

    const todaysAdvanced = await prisma.advancedBooking.count({
      where: {
        acceptedBid: { driverId: user.driver.id },
        pickupTime: { gte: today, lt: tomorrow },
        status: "ACCEPTED",
      },
    });

    // Count upcoming jobs (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingInstant = await prisma.instantBooking.count({
      where: {
        driverId: user.driver.id,
        pickupTime: { gte: tomorrow, lte: nextWeek },
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
      },
    });

    const upcomingAdvanced = await prisma.advancedBooking.count({
      where: {
        acceptedBid: { driverId: user.driver.id },
        pickupTime: { gte: tomorrow, lte: nextWeek },
        status: "ACCEPTED",
      },
    });

    // Count completed jobs (all time)
    const completedInstant = await prisma.instantBooking.count({
      where: {
        driverId: user.driver.id,
        status: "COMPLETED",
      },
    });

    const completedAdvanced = await prisma.advancedBooking.count({
      where: {
        acceptedBid: { driverId: user.driver.id },
        status: "COMPLETED",
      },
    });

    // Calculate total earnings from accepted bids
    const acceptedBids = await prisma.bid.findMany({
      where: {
        driverId: user.driver.id,
        status: "ACCEPTED",
      },
      select: {
        amountCents: true,
      },
    });

    const totalEarnings = acceptedBids.reduce(
      (sum, bid) => sum + bid.amountCents,
      0
    );

    return {
      success: true,
      stats: {
        todaysJobs: todaysInstant + todaysAdvanced,
        upcomingJobs: upcomingInstant + upcomingAdvanced,
        completedJobs: completedInstant + completedAdvanced,
        totalEarnings, // in pence
      },
    };
  } catch (error) {
    console.error("❌ Error fetching driver stats:", error);
    return { success: false, error: error.message };
  }
}