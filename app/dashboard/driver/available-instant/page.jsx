// app/dashboard/driver/available-instant/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableInstantBookingsClient from "@/components/dashboard/driver/AvailableInstantBookingsClient";
import { matchDriverToBookings } from "@/lib/matching/bookingMatcher";

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

  const driver = user.driver;

  // Check if driver has location set
  if (!driver.baseLat || !driver.baseLng) {
    return (
      <AvailableInstantBookingsClient
        driver={driver}
        bookings={[]}
        error="Please update your profile with a valid postcode to see available bookings."
      />
    );
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
              lat: true,
              lng: true,
            },
          },
        },
      },
    },
    orderBy: {
      pickupTime: "asc", // Show soonest first
    },
    take: 100, // Get more, we'll filter by matching
  });

  // Add coordinates to bookings (using business location)
  const bookingsWithCoords = availableBookings
    .filter(booking => booking.createdBy?.business?.lat && booking.createdBy?.business?.lng)
    .map(booking => ({
      ...booking,
      pickupLat: booking.createdBy.business.lat,
      pickupLng: booking.createdBy.business.lng,
    }));

  // Match driver to bookings using the algorithm
  const matches = matchDriverToBookings(driver, bookingsWithCoords);

  // Format matches for the client component
  const matchedBookings = matches.map(match => ({
    ...match.booking,
    matchScore: match.overallScore,
    distance: match.distance,
    estimatedPickupMinutes: match.estimatedPickupMinutes,
    accessibilityCompatibility: match.accessibilityMatch.compatibilityScore,
    missingPreferences: match.accessibilityMatch.missingPreferences,
  }));

  return (
    <AvailableInstantBookingsClient
      driver={driver}
      bookings={matchedBookings}
      totalAvailable={availableBookings.length}
      matchedCount={matchedBookings.length}
    />
  );
}