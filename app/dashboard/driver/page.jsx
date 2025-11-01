// app/dashboard/driver/page.jsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DriverDashboardClient from "@/components/dashboard/driver/DriverDashboardClient";
import DriverOnboardingForm from "@/components/forms/driver/DriverOnboardingForm";
import { getDriverStats } from "@/app/actions/driver/getDriverProfile";
import { getDriverBookingsForToday } from "@/app/actions/driver/getDriverBookings";
import { getAvailableInstantBookings, getAvailableAdvancedBookings } from "@/app/actions/bookings/getBookings";

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
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
  const recentBids = await prisma.bid.findMany({
  where: {
    driverId: user.driver.id,
  },
  include: {
    advancedBooking: {
      include: {
        accessibilityProfile: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 5, // Show last 5 bids
});

  if (!user) {
    redirect("/auth/login");
  }

  const hasOnboarded = !!user.driver;

  // If not onboarded, show onboarding form
  if (!hasOnboarded) {
    return <DriverOnboardingForm />;
  }
  

  // Fetch dashboard data
  const [statsResult, todaysBookings, availableInstant, availableAdvanced] = await Promise.all([
    getDriverStats(),
    getDriverBookingsForToday(),
    getAvailableInstantBookings(),
    getAvailableAdvancedBookings(),
  ]);



  return (
    <DriverDashboardClient
      user={user}
      driver={user.driver}
      stats={statsResult.success ? statsResult.stats : null}
      todaysBookings={todaysBookings.success ? todaysBookings : { instant: [], advanced: [] }}
      availableInstant={availableInstant.success ? availableInstant.bookings : []}
      availableAdvanced={availableAdvanced.success ? availableAdvanced.bookings : []}
      recentBids={recentBids}
    />
  );
}