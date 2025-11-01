// app/dashboard/driver/my-bids/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MyBidsClient from "@/components/dashboard/driver/MyBidsClient";

export default async function DriverMyBidsPage() {
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

  // Get all bids for this driver
  const allBids = await prisma.bid.findMany({
    where: {
      driverId: user.driver.id,
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
      createdAt: "desc",
    },
  });

  // Separate by status
  const pendingBids = allBids.filter((bid) => bid.status === "PENDING");
  const acceptedBids = allBids.filter((bid) => bid.status === "ACCEPTED");
  const rejectedBids = allBids.filter((bid) => bid.status === "REJECTED");

  // Calculate stats
  const stats = {
    total: allBids.length,
    pending: pendingBids.length,
    accepted: acceptedBids.length,
    rejected: rejectedBids.length,
    winRate:
      allBids.length > 0
        ? ((acceptedBids.length / (acceptedBids.length + rejectedBids.length)) * 100).toFixed(1)
        : 0,
    totalEarnings: acceptedBids.reduce((sum, bid) => sum + bid.amountCents, 0),
  };

  return (
    <MyBidsClient
      pendingBids={pendingBids}
      acceptedBids={acceptedBids}
      rejectedBids={rejectedBids}
      stats={stats}
      driverName={user.name}
    />
  );
}