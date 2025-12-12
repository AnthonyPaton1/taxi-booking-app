// app/dashboard/driver/available/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableBookingsClient from "@/components/dashboard/driver/AvailableBookingsClient";
import { getAvailableBookings } from "@/app/actions/bookings/getBookings";

export default async function AvailableBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  // ✅ Fetch user/driver once
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

  const driver = user.driver;

  // Check if driver has location set
  if (!driver.baseLat || !driver.baseLng) {
    return (
      <AvailableBookingsClient
        driver={driver}
        bookings={[]}
        error="Please update your profile with a valid postcode to see available bookings."
      />
    );
  }

  // ✅ Use the action (returns bookings with matchScore and distance)
  const result = await getAvailableBookings(driver, user.id);

  if (!result.success) {
    return (
      <AvailableBookingsClient
        driver={driver}
        bookings={[]}
        error={result.error || "Failed to load bookings"}
      />
    );
  }

  // ✅ Get total available count (before matching)
  const totalAvailable = await prisma.booking.count({
    where: {
      status: "PENDING",
      pickupTime: { gte: new Date() },
      visibility: { in: ["PUBLIC", "PRIVATE_TO_COMPANY"] },
      deletedAt: null,
    },
  });

  return (
    <AvailableBookingsClient
      driver={driver}
      driverId={driver.id}
      bookings={result.bookings}  
      totalAvailable={totalAvailable}
      matchedCount={result.count}
    />
  );
}