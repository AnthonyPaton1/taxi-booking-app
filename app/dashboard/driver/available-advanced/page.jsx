// app/dashboard/driver/available-advanced/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableAdvancedBookingsClient from "@/components/dashboard/driver/AvailableAdvancedBookingsClient";

export default async function AvailableAdvancedBookingsPage() {
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

  // Get all open advanced bookings that haven't passed the bid deadline
  const availableBookings = await prisma.advancedBooking.findMany({
    where: {
      status: "OPEN",
      bidDeadline: {
        gte: new Date(), // Only show bookings with future bid deadlines
      },
      visibility: {
        in: ["PUBLIC", "PRIVATE_TO_COMPANY"],
      },
    },
    include: {
      accessibilityProfile: true,
      bids: {
        where: {
          driverId: user.driver.id,
        },
        select: {
          id: true,
          amountCents: true,
          status: true,
          createdAt: true,
        },
      },
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
      _count: {
        select: {
          bids: true,
        },
      },
    },
    orderBy: {
      bidDeadline: "asc", // Show urgent ones first
    },
  });

  return (
    <AvailableAdvancedBookingsClient
      driver={user.driver}
      bookings={availableBookings}
    />
  );
}