// app/dashboard/driver/schedule/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DailyScheduleClient from "@/components/dashboard/driver/DailyScheduleClient";

export default async function DailySchedulePage() {
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

  // Get start and end of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // ✅ Get all of today's bookings (unified)
  const bookings = await prisma.booking.findMany({
    where: {
      driverId: user.driver.id,
      status: {
        in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"],
      },
      pickupTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      deletedAt: null,
    },
    include: {
      accessibilityProfile: true,
      acceptedBid: {
        select: {
          amountCents: true,
          etaMinutes: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          phone: true,
          business: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      pickupTime: "asc",
    },
  });

  return (
    <DailyScheduleClient 
      bookings={bookings}  
      driverName={user.driver.name}
    />
  );
}