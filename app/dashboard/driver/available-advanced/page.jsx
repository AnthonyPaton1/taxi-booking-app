// app/dashboard/driver/available-advanced/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableAdvancedBookingsClient from "@/components/dashboard/driver/AvailableAdvancedBookingsClient";
import { matchDriverToBookingsCached } from "@/lib/matching/cached-matching-algorithm";

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

  const driver = user.driver;

  // Check if driver has location set
  if (!driver.baseLat || !driver.baseLng) {
    return (
      <AvailableAdvancedBookingsClient
        driver={driver}
        bookings={[]}
        error="Please update your profile with a valid postcode to see available bookings."
      />
    );
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
          driverId: driver.id,
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
              lat: true,
              lng: true,
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

  // Add coordinates to bookings (using business location)
  // TODO: In future, geocode actual pickup addresses for more accuracy
 const bookingsWithCoords = availableBookings
  .filter(booking => 
    booking.pickupLatitude && 
    booking.pickupLongitude
  )
  .map(booking => ({
    ...booking,
    pickupLat: booking.pickupLatitude,   
    pickupLng: booking.pickupLongitude,  
  }));

  // Match driver to bookings using the algorithm
  const matches = await matchDriverToBookingsCached(driver, bookingsWithCoords);
/*
console.log('=== DRIVER AVAILABLE ADVANCED DEBUG ===');
console.log('Total available bookings:', availableBookings.length);
console.log('Bookings with coords:', bookingsWithCoords.length);
console.log('Matched bookings:', matches.length);
console.log('Matches:', matches.map(m => ({
  id: m.booking.id.substring(0, 8),
  pickup: m.booking.pickupLocation,
  score: m.score,
  distance: m.distance
})));
*/

  // Format matches for the client component
  const matchedBookings = matches.map(match => ({
    ...match.booking,
    matchScore: match.score,
    distance: match.distance,
    scoreBreakdown: match.scoreBreakdown
   
  }));

  return (
      <AvailableAdvancedBookingsClient
    driver={driver}
    driverId={driver.id}
    bookings={matchedBookings}
    totalAvailable={availableBookings.length}
    matchedCount={matchedBookings.length}
  />
  );
}