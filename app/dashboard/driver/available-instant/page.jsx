// app/dashboard/driver/available-instant/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableInstantBookingsClient from "@/components/dashboard/driver/AvailableInstantBookingsClient";

export default async function AvailableInstantBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      driver: {
        include: {
          accessibilityProfile: true,
        },
      },
    },
  });

  if (!user || !user.driver) {
    redirect("/dashboard/driver");
  }

  // Get all pending instant bookings that haven't been accepted yet
  const availableBookings = await prisma.instantBooking.findMany({
    where: {
      status: "PENDING",
      driverId: null, // Not yet claimed
      pickupTime: {
        gte: new Date(), // Only future bookings
      },
    },
    include: {
      accessibilityProfile: true,
      createdBy: {
        select: {
          name: true,
          business: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      pickupTime: "asc", // Show soonest first
    },
    take: 50, // Limit to 50 most urgent
  });

  return (
    <AvailableInstantBookingsClient
      driver={user.driver}
      bookings={availableBookings}
    />
  );
}