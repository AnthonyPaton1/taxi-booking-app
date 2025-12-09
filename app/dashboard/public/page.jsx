// app/dashboard/public/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PublicDashboardClient from "@/components/dashboard/public/PublicDashboardClient";
import { getRecentTripsForUser } from "@/app/actions/bookings/getRecentTripsForUser";

export const metadata = {
  title: "My Bookings - Accessible Transport",
  description: "View and manage your transport bookings",
};

export default async function PublicDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PUBLIC") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // Get user's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeBookings, awaitingAction, pastBookings] = await Promise.all([
    // Active/upcoming bookings
    prisma.booking.findMany({
      where: {
        createdById: user.id,
        pickupTime: { gte: today },
        status: { in: ["PENDING", "BID_ACCEPTED", "ACCEPTED", "IN_PROGRESS"] },
      },
      include: {
        accessibilityProfile: true,
        bids: {
          where: { status: "PENDING" },
          include: {
            driver: {
              include: {
                user: {
                  select: { 
                    name: true, 
                    phone: true, 
                    email: true 
                  }
                }
              }
            },
          },
          orderBy: { amountCents: "asc" },
        },
        acceptedBid: {
          include: {
            driver: {
              include: {
                user: {
                  select: { 
                    name: true, 
                    phone: true, 
                    email: true 
                  }
                }
              }
            },
          },
        },
      },
      orderBy: { pickupTime: "asc" },
      take: 10,
    }),

    // Bookings with bids needing review
    prisma.booking.count({
      where: {
        createdById: user.id,
        status: "PENDING",
        bids: { some: { status: "PENDING" } },
      },
    }),

    // Past bookings
    prisma.booking.count({
      where: {
        createdById: user.id,
        status: { in: ["COMPLETED", "CANCELED"] },
      },
    }),
  ]);

  const stats = {
    active: activeBookings.length,
    awaitingAction,
    past: pastBookings,
  };

  // ✅ Get recent trips for this public user (uses their user ID)
  const recentTripsResult = await getRecentTripsForUser(10);
  
  if (!recentTripsResult.success) {
    console.error("Failed to load recent trips:", recentTripsResult.error);
  }

  return (
    <PublicDashboardClient
      user={user}
      activeBookings={activeBookings}
      stats={stats}
      recentTrips={recentTripsResult.trips || []}
    />
  );
}