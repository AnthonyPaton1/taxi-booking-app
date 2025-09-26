// app/actions/getDriverBookings.js

"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getDriverBookingsForToday() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  if (process.env.NODE_ENV !== "production") {
  console.warn("Driver not found — possibly not onboarded");
}

if (!session?.user?.id) {
  console.warn("No session or user ID in getAvailableAdvancedBookings");
  return [];
}

const driver = await prisma.driver.findUnique({ where: { userId } });

if (!driver) {
  console.warn(`Driver record not found for user ID: ${userId}`);
  return [];
}

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bids = await prisma.bid.findMany({
    where: {
      driverId: session.user.id,
      status: "WON",
      pickupTime: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      booking: true,
    },
  });

  return bids.map((bid) => bid.booking);
}