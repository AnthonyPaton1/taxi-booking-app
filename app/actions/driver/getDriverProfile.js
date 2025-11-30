// app/actions/driver/getDriverProfile.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

/**
 * Get complete driver profile with all relations
 */
// app/actions/driver/getDriverProfile.js

export async function getDriverStats() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { driver: true },
    });

    if (!user?.driver) {
      return { success: false, error: "No driver profile found" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ Count today's jobs (unified)
    const todaysJobs = await prisma.booking.count({
      where: {
        driverId: user.driver.id,
        pickupTime: { gte: today, lt: tomorrow },
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
        deletedAt: null,
      },
    });

    // ✅ Count upcoming jobs (unified)
    const upcomingJobs = await prisma.booking.count({
      where: {
        driverId: user.driver.id,
        pickupTime: { gte: new Date() },
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
        deletedAt: null,
      },
    });

    // ✅ Count completed jobs (unified)
    const completedJobs = await prisma.booking.count({
      where: {
        driverId: user.driver.id,
        status: "COMPLETED",
        deletedAt: null,
      },
    });

    // ✅ Calculate total earnings (unified)
    const completedWithEarnings = await prisma.booking.findMany({
      where: {
        driverId: user.driver.id,
        status: "COMPLETED",
        deletedAt: null,
      },
      include: {
        acceptedBid: true,
      },
    });

    const totalEarnings = completedWithEarnings.reduce((sum, booking) => {
      return sum + (booking.acceptedBid?.amountCents || booking.finalCostPence || 0);
    }, 0);

    return {
      success: true,
      stats: {
        todaysJobs,
        upcomingJobs,
        completedJobs,
        totalEarnings,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching driver stats:", error);
    return { success: false, error: error.message };
  }
}