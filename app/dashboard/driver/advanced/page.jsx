// app/dashboard/driver/advanced/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableAdvancedBookingsClient from "@/components/dashboard/driver/availableAdvancedBookingsClient";

export default async function AvailableAdvancedBookingsPage() {
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

  // Get available advanced bookings (OPEN status, pickup time in future)
  const availableBookings = await prisma.advancedBooking.findMany({
    where: {
      status: "OPEN",
      pickupTime: {
        gte: new Date(),
      },
    },
    include: {
      accessibilityProfile: true,
      bids: {
        where: {
          driverId: user.driver.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // Get driver's latest bid if exists
      },
      _count: {
        select: {
          bids: true, // Count all bids
        },
      },
    },
    orderBy: {
      pickupTime: "asc",
    },
  });

  return (
    <AvailableAdvancedBookingsClient
      bookings={availableBookings}
      driverId={user.driver.id}
    />
  );
}