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

  // Get accepted instant bookings
  const instantBookings = await prisma.instantBooking.findMany({
    where: {
      driverId: user.driver.id,
      status: "ACCEPTED",
      pickupTime: {
        gte: today,
        lte: sevenDaysFromNow,
      },
    },
    include: {
      accessibilityProfile: true,
      createdBy: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      pickupTime: "asc",
    },
  });

  // Get accepted advanced bookings (via accepted bids)
  const acceptedBids = await prisma.bid.findMany({
    where: {
      driverId: user.driver.id,
      status: "ACCEPTED",
      advancedBooking: {
        pickupTime: {
          gte: today,
          lte: sevenDaysFromNow,
        },
        status: "ACCEPTED",
      },
    },
    include: {
      advancedBooking: {
        include: {
          accessibilityProfile: true,
          createdBy: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      advancedBooking: {
        pickupTime: "asc",
      },
    },
  });

  const advancedBookings = acceptedBids.map((bid) => ({
    ...bid.advancedBooking,
    bidAmount: bid.amountCents,
  }));

  // Combine and organize by day
  const allBookings = [
    ...instantBookings.map((b) => ({ ...b, type: "instant" })),
    ...advancedBookings.map((b) => ({ ...b, type: "advanced" })),
  ].sort((a, b) => new Date(a.pickupTime) - new Date(b.pickupTime));

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