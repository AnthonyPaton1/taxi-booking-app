// app/dashboard/driver/instant/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableInstantBookingsClient from "@/components/dashboard/driver/availableInstantBookingsClient";

export default async function AvailableInstantBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }, // Use id instead of email
    include: {
      driver: true,
    },
  });

  if (!user || !user.driver) {
    redirect("/dashboard/driver");
  }

  // Get available instant bookings (PENDING status, pickup time in future)
  const availableBookings = await prisma.instantBooking.findMany({
    where: {
      status: "PENDING",
      pickupTime: {
        gte: new Date(),
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

  return (
    <AvailableInstantBookingsClient
      bookings={availableBookings}
      driverId={user.driver.id}
    />
  );
}