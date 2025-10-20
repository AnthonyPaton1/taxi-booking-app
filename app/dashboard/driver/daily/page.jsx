// app/dashboard/driver/daily/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DailyScheduleClient from "@/components/dashboard/driver/dailyScheduleClient";

export default async function DailySchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      driver: true,
    },
  });

  if (!user || !user.driver) {
    redirect("/dashboard/driver");
  }

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's instant bookings
  const todaysInstantBookings = await prisma.instantBooking.findMany({
    where: {
      driverId: user.driver.id,
      pickupTime: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: ["ACCEPTED", "COMPLETED"],
      },
    },
    include: {
      accessibilityProfile: true,
      business: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      pickupTime: "asc",
    },
  });

  // Fetch today's advanced bookings (accepted bids)
  const todaysAdvancedBookings = await prisma.advancedBooking.findMany({
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
      acceptedBid: true,
      accessibilityProfile: true,
    },
    orderBy: {
      pickupTime: "asc",
    },
  });

  return (
    <DailyScheduleClient
      instantBookings={todaysInstantBookings}
      advancedBookings={todaysAdvancedBookings}
      driverName={user.driver.name || user.name}
    />
  );
}