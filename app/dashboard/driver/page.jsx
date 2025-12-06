// app/dashboard/driver/page.jsx

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DriverDashboardClient from "@/components/dashboard/driver/DriverDashboardClient";
import dynamic from 'next/dynamic';
import { getDriverStats } from "@/app/actions/driver/getDriverProfile";
import { getDriverBookingsForToday } from "@/app/actions/driver/getDriverBookings";
import { getAvailableBookings } from "@/app/actions/bookings/getBookings"; 
import SubscriptionBadge from "@/components/dashboard/driver/SubscriptionBadge"; 

const DriverOnboardingForm = dynamic(
  () => import('@/components/forms/driver/DriverOnboardingForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

// Fetch user with driver profile
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
  include: {
    driver: {
      include: {
        accessibilityProfile: true,
        compliance: true,
      },
    },
  },
});

if (!user) {
  redirect("/auth/login");
}

  const hasOnboarded = !!user.driver;

  if (!hasOnboarded) {
    return <DriverOnboardingForm />;
  }



const recentBids = await prisma.bid.findMany({
  where: {
    driverId: user.driver.id,
    booking: {
      deletedAt: null,  
    },
  },
  include: {
    booking: {
      include: {
        accessibilityProfile: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 5,
});

  // ✅ Fetch dashboard data (unified)
  const [statsResult, todaysBookings, availableBookingsResult] = await Promise.all([
    getDriverStats(),
    getDriverBookingsForToday(),
    getAvailableBookings(),  
  ]);

  return (<>
    
    <DriverDashboardClient
      user={user}
      driver={user.driver}
      stats={statsResult.success ? statsResult.stats : null}
      todaysBookings={todaysBookings.success ? todaysBookings.bookings : []}  
      availableBookings={availableBookingsResult.success ? availableBookingsResult.bookings : []}  
      recentBids={recentBids}
      />
      <SubscriptionBadge driver={user.driver} />
      </>
  );
}