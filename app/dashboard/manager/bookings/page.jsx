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

  if (!user) {
    redirect("/login");
  }

  // Await searchParams
  const params = await searchParams;
  const filter = params?.filter || "all";
  const search = params?.search || "";
  const page = parseInt(params?.page) || 1;
  const pageSize = 20;

  // ✅ Base query for unified bookings
  const baseWhere = {
    createdById: user.id,
    deletedAt: null,
  };

  if (search) {
    baseWhere.OR = [
      { pickupLocation: { contains: search, mode: "insensitive" } },
      { dropoffLocation: { contains: search, mode: "insensitive" } },
      { 
        initials: {
          hasSome: [search.toUpperCase()]
        }
      },
    ];
  }

  // ✅ Apply filter to unified bookings
  const bookingWhere = { ...baseWhere };

  if (filter === "all") {
    bookingWhere.status = { in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"] };
  } else if (filter === "pending") {
    bookingWhere.status = "PENDING";
    bookingWhere.bids = { some: {} };
  } else if (filter === "awaiting") {
    bookingWhere.status = "PENDING";
    bookingWhere.bids = { none: {} };
  } else if (filter === "confirmed") {
    bookingWhere.status = { in: ["BID_ACCEPTED", "ACCEPTED"] };
  } else if (filter === "completed") {
    bookingWhere.status = "COMPLETED";
  } else if (filter === "canceled") {
    bookingWhere.status = "CANCELED";
  } else if (filter === "upcoming") {
    bookingWhere.pickupTime = { gte: new Date() };
    bookingWhere.status = { in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"] };
  }

  // ✅ Get total count for pagination
  const totalCount = await prisma.booking.count({
    where: bookingWhere,
  });

  // ✅ Fetch unified bookings
  const bookings = await prisma.booking.findMany({
    where: bookingWhere,
    include: {
      accessibilityProfile: true,
      driver: {
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      },
      bids: {
        include: {
          driver: {
            select: { 
              id: true,
              name: true, 
              vehicleClass: true, 
              phone: true 
            },
          },
        },
        orderBy: { amountCents: "asc" },
      },
      acceptedBid: {
        include: {
          driver: {
            select: { 
              id: true,
              name: true, 
              vehicleClass: true, 
              phone: true 
            },
          },
        },
      },
      createdBy: {
        select: {
          name: true,
          houses: {
            select: {
              label: true,
              id: true,
            },
          },
        },
      },
    },
    orderBy: { pickupTime: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  // ✅ Get counts for filter tabs
  const [total, pending, awaiting, confirmed, upcoming, canceled, completed] = await Promise.all([
    prisma.booking.count({
      where: {
        createdById: user.id,
        status: { in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"] },
        deletedAt: null,
      }
    }),
    prisma.booking.count({
      where: { 
        createdById: user.id, 
        status: "PENDING", 
        bids: { some: {} },
        deletedAt: null,
      },
    }),
    prisma.booking.count({
      where: { 
        createdById: user.id, 
        status: "PENDING", 
        bids: { none: {} },
        deletedAt: null,
      },
    }),
    prisma.booking.count({
      where: { 
        createdById: user.id, 
        status: { in: ["BID_ACCEPTED", "ACCEPTED"] },
        deletedAt: null,
      },
    }),
    prisma.booking.count({
      where: {
        createdById: user.id,
        pickupTime: { gte: new Date() },
        status: { in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"] },
        deletedAt: null,
      },
    }),
    prisma.booking.count({
      where: { 
        createdById: user.id, 
        status: "CANCELED",
        deletedAt: null,
      },
    }),
    prisma.booking.count({
      where: { 
        createdById: user.id, 
        status: "COMPLETED",
        deletedAt: null,
      },
    }),
  ]);

  const counts = { 
    all: total, 
    pending, 
    awaiting, 
    confirmed, 
    upcoming, 
    canceled, 
    completed 
  };

  return (
    <AllBookingsListClient
      bookings={bookings}
      counts={counts}
      currentFilter={filter}
      currentSearch={search}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}