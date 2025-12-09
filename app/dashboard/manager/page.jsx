// app/dashboard/manager/page.jsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ManagerDashboardClient from "@/components/dashboard/business/manager/managerdashboardClient";
import { getRecentTripsForUser } from "@/app/actions/bookings/getRecentTripsForUser";
import OnboardingManager from "@/components/forms/business/managerOnboardingForm";

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Get user with houses
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      houses: {
        where: {
          deletedAt: null, 
        },
        include: {
          area: true,
          residents: true, 
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Check if manager has onboarded (has houses)
  if (!user.managerOnboarded || user.houses.length === 0) {
    const area = user.areaId ? await prisma.area.findUnique({
      where: { id: user.areaId }
    }) : null;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.name}!
            </h1>
            <p className="text-gray-600">
              Let's get your properties set up in the system
            </p>
          </div>

          <OnboardingManager 
            managerEmail={user.email}
            name={user.name}
            area={area?.name || ""}
          />
        </div>
      </div>
    );
  }

  // Get recent trips for this manager
  const recentTripsResult = await getRecentTripsForUser(10);
  
  if (!recentTripsResult.success) {
    console.error("Failed to load recent trips:", recentTripsResult.error);
  }

  // Get manager's bookings (unified)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingBookings, pendingBids, completedCount] = await Promise.all([
    //  Upcoming bookings (unified)
    prisma.booking.findMany({
      where: {
        createdById: user.id,
        pickupTime: {
          gte: today,
        },
        status: {
          in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"],  //  Updated statuses
        },
        deletedAt: null,
      },
      include: {
        accessibilityProfile: true,
        bids: {
          include: {
            driver: {
              select: {
                id: true,
                vehicleClass: true,
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: {
            amountCents: "asc",
          },
        },
        acceptedBid: {
          include: {
            driver: {
              select: {
                id: true,
                vehicleClass: true,
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        pickupTime: "asc",
      },
      take: 10,
    }),

    //  Count bookings needing attention (have bids but not accepted)
    prisma.booking.count({
      where: {
        createdById: user.id,
        status: "PENDING",  //  Changed from "OPEN"
        bids: {
          some: {},
        },
        deletedAt: null,
      },
    }),

    //  Count completed bookings
    prisma.booking.count({
      where: {
        createdById: user.id,
        status: "COMPLETED",
        deletedAt: null,
      },
    }),
  ]);

  const stats = {
    totalHouses: user.houses.length,
    upcomingRides: upcomingBookings.length,
    pendingBids,
    completedRides: completedCount,
  };

  return (
    <ManagerDashboardClient
      user={user}
      houses={user.houses}
      upcomingBookings={upcomingBookings}
      stats={stats}
      recentTrips={recentTripsResult.trips || []}
    />
  );
}