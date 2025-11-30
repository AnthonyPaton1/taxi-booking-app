// app/dashboard/driver/weekly-schedule/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import WeeklyScheduleClient from "@/components/dashboard/driver/WeeklyScheduleClient";

export default async function DriverWeeklySchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      driver: true,
    },
  });

  if (!user?.driver) {
    redirect("/dashboard");
  }

  // Get next 7 days of accepted bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // ✅ Get all accepted bookings (unified)
  const bookings = await prisma.booking.findMany({
    where: {
      driverId: user.driver.id,
      status: {
        in: ["ACCEPTED", "IN_PROGRESS"],
      },
      pickupTime: {
        gte: today,
        lte: sevenDaysFromNow,
      },
      deletedAt: null,
    },
    include: {
      accessibilityProfile: true,
      createdBy: {
        select: {
          name: true,
          phone: true,
        },
      },
      acceptedBid: {
        select: {
          amountCents: true,
        },
      },
    },
    orderBy: {
      pickupTime: "asc",
    },
  });

  // ✅ Format bookings with serializable dates and earnings
  const allBookings = bookings.map((b) => ({
    ...b,
    // Convert Date objects to ISO strings for serialization
    pickupTime: b.pickupTime.toISOString(),
    returnTime: b.returnTime ? b.returnTime.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    confirmedAt: b.confirmedAt ? b.confirmedAt.toISOString() : null,
    canceledAt: b.canceledAt ? b.canceledAt.toISOString() : null,
    acceptedAt: b.acceptedAt ? b.acceptedAt.toISOString() : null,
    bidDeadline: b.bidDeadline ? b.bidDeadline.toISOString() : null,
    // Get earnings from acceptedBid or finalCostPence
    bidAmount: b.acceptedBid?.amountCents || b.finalCostPence || 0,
  }));

  // Group by day
  const bookingsByDay = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    bookingsByDay[dateKey] = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.pickupTime)
        .toISOString()
        .split("T")[0];
      return bookingDate === dateKey;
    });
  }

  // Calculate stats
  const stats = {
    totalJobs: allBookings.length,
    totalEarnings: allBookings.reduce(
      (sum, b) => sum + (b.bidAmount || 0),
      0
    ),
    busiestDay: Object.entries(bookingsByDay).reduce(
      (max, [date, bookings]) => {
        return bookings.length > max.count
          ? { date, count: bookings.length }
          : max;
      },
      { date: null, count: 0 }
    ),
  };

  return (
    <WeeklyScheduleClient
      bookingsByDay={bookingsByDay}
      stats={stats}
      driverName={user.name}
    />
  );
}