// app/dashboard/driver/available/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailableBookingsClient from "@/components/dashboard/driver/AvailableBookingsClient";  
import { matchDriverToBookingsCached } from "@/lib/matching/cached-matching-algorithm";

export default async function AvailableBookingsPage() {  
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
      <AvailableBookingsClient
        driver={driver}
        bookings={[]}
        error="Please update your profile with a valid postcode to see available bookings."
      />
    );
  }

  // Get all PENDING bookings (unified - available for bidding)
  const availableBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING", 
      pickupTime: {
        gte: new Date(),  
      },
      visibility: {
        in: ["PUBLIC", "PRIVATE_TO_COMPANY"],
      },
      deletedAt: null,
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
      pickupTime: "asc",  
      
    },
  });

  // Add coordinates for matching
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
  const driverForMatching = {
    id: driver.id,
    approved: driver.approved,
    suspended: driver.suspended || false,
    hasWAV: driver.hasWAV,
    wavOnly: driver.wavOnly || false,
    femaleDriverOnly: driver.femaleDriverOnly || false,
    baseLat: driver.baseLat,
    baseLng: driver.baseLng,
    radiusMiles: driver.radiusMiles || 25,
    rating: driver.rating || 0,
    completedRides: driver.completedRides || 0,
  };

  const matches = await matchDriverToBookingsCached(driverForMatching, bookingsWithCoords);

  const safeMatches = Array.isArray(matches) ? matches : [];
  const matchedBookings = safeMatches.map(match => ({
    ...match.booking,
    matchScore: match.score,
    distance: match.distance,
  }));

 

  return (
    <AvailableBookingsClient
      driver={driver}
      driverId={driver.id}
      bookings={matchedBookings}
      totalAvailable={availableBookings.length}
      matchedCount={matchedBookings.length}
    />
  );
}