// app/api/house/trips/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    // Get NextAuth session instead of house session cookie
    const session = await getServerSession(authOptions);
    
    // Check if user is house staff
    if (!session?.user?.role || session.user.role !== "HOUSE_STAFF") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get houseId from session
    const houseId = session.user.houseId;

    if (!houseId) {
      return NextResponse.json(
        { error: "House ID not found in session" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "today";

    // Get house info
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      select: {
        id: true,
        label: true,
        residents: {
          select: {
            id: true,
            name: true,
            initials: true,
          },
        },
      },
    });

    if (!house) {
      return NextResponse.json(
        { error: "House not found" },
        { status: 404 }
      );
    }

    // Get resident IDs for this house
  const residentInitials = house.residents.map(r => r.initials);

if (residentInitials.length === 0) {
  // No residents, return empty
  return NextResponse.json({
    success: true,
    house: { id: house.id, label: house.label },
    view,
    trips: [],
    tripsByDate: {},
    stats: { totalTrips: 0, todayTrips: 0 },
  });
}

    // Calculate date range
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startDate = view === "today" ? startOfToday : startOfWeek;
    const endDate = view === "today" ? endOfToday : endOfWeek;

    // Fetch bookings where residents from this house are involved
 const bookings = await prisma.booking.findMany({
  where: {
    deletedAt: null,
    status: {
      in: ["ACCEPTED", "BID_ACCEPTED", "IN_PROGRESS", "COMPLETED"],
    },
    pickupTime: {
      gte: startDate,
      lt: endDate,
    },
    initials: {
      hasSome: residentInitials, // Check if booking initials overlap with house residents
    },
  },
  include: {
    accessibilityProfile: true,
    driver: {
      include: {
        user: {
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

// Transform bookings
const trips = bookings.map((booking) => {
  // Match booking initials to our residents
  const matchingResidents = house.residents.filter(r => 
    booking.initials.includes(r.initials)
  );
  
  const residentNames = matchingResidents.map(r => r.name).join(", ");
  const residentInitials = matchingResidents.map(r => r.initials).join(", ");

  return {
    id: booking.id,
    residentName: residentNames,
    residentInitials: residentInitials,
    
    outbound: {
      time: booking.pickupTime,
      pickup: booking.pickupLocation,
      dropoff: booking.dropoffLocation,
      driverName: booking.driver?.user?.name || "Not assigned",
      costPence: booking.finalCostPence || booking.estimatedCostPence,
    },
    
    return: booking.returnTime ? {
      time: booking.returnTime,
      pickup: booking.dropoffLocation,
      dropoff: booking.pickupLocation,
      driverName: booking.driver?.user?.name || "Not assigned",
      costPence: booking.finalCostPence || booking.estimatedCostPence,
    } : null,
    
    status: booking.status,
  };
});

    // Group trips by date
    const tripsByDate = {};
    
    trips.forEach(trip => {
      const dateKey = new Date(trip.outbound.time).toISOString().split('T')[0];
      if (!tripsByDate[dateKey]) {
        tripsByDate[dateKey] = [];
      }
      tripsByDate[dateKey].push(trip);
    });

    return NextResponse.json({
      success: true,
      house: {
        id: house.id,
        label: house.label,
      },
      view,
      trips,
      tripsByDate,
      stats: {
        totalTrips: trips.length,
        todayTrips: view === "today" ? trips.length : tripsByDate[startOfToday.toISOString().split('T')[0]]?.length || 0,
      },
    });

  } catch (error) {
    console.error("Error fetching house trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}