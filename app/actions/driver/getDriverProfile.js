// app/actions/driver/getDriverProfile.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from '@/lib/redis';

// app/actions/driver/getDriverProfile.js

export async function getDriverStats(driverId) {  // ✅ Accept driverId
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ No more session check or user fetch - just use driverId
    const [todaysJobs, upcomingJobs, completedWithEarnings] = await Promise.all([
      prisma.booking.count({
        where: {
          driverId: driverId,  // ✅ Use passed driverId
          pickupTime: { gte: today, lt: tomorrow },
          status: { in: ["ACCEPTED", "IN_PROGRESS"] },
          deletedAt: null,
        },
      }),
      
      prisma.booking.count({
        where: {
          driverId: driverId,
          pickupTime: { gte: new Date() },
          status: { in: ["ACCEPTED", "IN_PROGRESS"] },
          deletedAt: null,
        },
      }),
      
      prisma.booking.findMany({
        where: {
          driverId: driverId,
          status: "COMPLETED",
          deletedAt: null,
        },
        select: {
          id: true,
          finalCostPence: true,
          acceptedBid: {
            select: { amountCents: true },
          },
        },
      }),
    ]);

    const completedJobs = completedWithEarnings.length;
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