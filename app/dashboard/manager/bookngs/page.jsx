// app/dashboard/manager/bookings/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AllBookingsListClient from "@/components/dashboard/business/allBookingsListClient";

export default async function AllBookingsPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const bookingType = searchParams?.type || "advanced"; // 'advanced' or 'instant'
  const filter = searchParams?.filter || "all";
  const search = searchParams?.search || "";

  // Common where clause
  const baseWhere = {
    createdById: user.id,
  };

  // Search filter
  if (search) {
    baseWhere.OR = [
      { pickupLocation: { contains: search, mode: "insensitive" } },
      { dropoffLocation: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fetch based on booking type
  let bookings = [];
  let counts = {};

  if (bookingType === "advanced") {
    // Advanced bookings where clause
    const advancedWhere = { ...baseWhere };

    if (filter === "pending") {
      advancedWhere.status = "OPEN";
      advancedWhere.bids = { some: {} };
    } else if (filter === "awaiting") {
      advancedWhere.status = "OPEN";
      advancedWhere.bids = { none: {} };
    } else if (filter === "confirmed") {
      advancedWhere.status = "ACCEPTED";
    } else if (filter === "completed") {
      advancedWhere.status = "COMPLETED";
    } else if (filter === "cancelled") {
      advancedWhere.status = "CANCELLED";
    } else if (filter === "upcoming") {
      advancedWhere.pickupTime = { gte: new Date() };
      advancedWhere.status = { in: ["OPEN", "ACCEPTED"] };
    }

    bookings = await prisma.advancedBooking.findMany({
      where: advancedWhere,
      include: {
        accessibilityProfile: true,
        bids: {
          include: {
            driver: {
              select: { name: true, vehicleType: true, phone: true },
            },
          },
          orderBy: { amountCents: "asc" },
        },
        acceptedBid: {
          include: {
            driver: {
              select: { name: true, vehicleType: true, phone: true },
            },
          },
        },
      },
      orderBy: { pickupTime: "desc" },
    });

    // Get counts for advanced bookings
    const [total, pending, awaiting, confirmed, upcoming] = await Promise.all([
      prisma.advancedBooking.count({ where: { createdById: user.id } }),
      prisma.advancedBooking.count({
        where: { createdById: user.id, status: "OPEN", bids: { some: {} } },
      }),
      prisma.advancedBooking.count({
        where: { createdById: user.id, status: "OPEN", bids: { none: {} } },
      }),
      prisma.advancedBooking.count({
        where: { createdById: user.id, status: "ACCEPTED" },
      }),
      prisma.advancedBooking.count({
        where: {
          createdById: user.id,
          pickupTime: { gte: new Date() },
          status: { in: ["OPEN", "ACCEPTED"] },
        },
      }),
    ]);

    counts = { all: total, pending, awaiting, confirmed, upcoming };
  } else {
    // Instant bookings where clause
    const instantWhere = { ...baseWhere };

    if (filter === "confirmed") {
      instantWhere.status = "ACCEPTED";
    } else if (filter === "completed") {
      instantWhere.status = "COMPLETED";
    } else if (filter === "cancelled") {
      instantWhere.status = "CANCELLED";
    } else if (filter === "upcoming") {
      instantWhere.pickupTime = { gte: new Date() };
      instantWhere.status = { in: ["PENDING", "ACCEPTED"] };
    }

    bookings = await prisma.booking.findMany({
      where: instantWhere,
      include: {
        resident: {
          include: { house: true },
        },
        assignedDriver: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
      },
      orderBy: { pickupTime: "desc" },
    });

    // Get counts for instant bookings
    const [total, confirmed, upcoming] = await Promise.all([
      prisma.booking.count({ where: { createdById: user.id } }),
      prisma.booking.count({
        where: { createdById: user.id, status: "ACCEPTED" },
      }),
      prisma.booking.count({
        where: {
          createdById: user.id,
          pickupTime: { gte: new Date() },
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      }),
    ]);

    counts = { all: total, pending: 0, awaiting: 0, confirmed, upcoming };
  }

  return (
    <AllBookingsListClient
      bookings={bookings}
      counts={counts}
      currentFilter={filter}
      currentSearch={search}
      bookingType={bookingType}
    />
  );
}