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

  // AWAIT searchParams first!
  const params = await searchParams;
  const bookingType = params?.type || "advanced";
  const filter = params?.filter || "all";
  const search = params?.search || "";
  const page = parseInt(params?.page) || 1;
  const pageSize = 20; 
 

  const baseWhere = {
    createdById: user.id,
  };

  if (search) {
    baseWhere.OR = [
      { pickupLocation: { contains: search, mode: "insensitive" } },
      { dropoffLocation: { contains: search, mode: "insensitive" } },
      { 
      initials: {
        hasSome: [search.toUpperCase()] // Search in initials array
      }
    },
    ];
  }

  let bookings = [];
  let counts = {};

  if (bookingType === "advanced") {
  const advancedWhere = { ...baseWhere };

    if (filter === "all") {
    
    advancedWhere.status = { in: ["OPEN", "ACCEPTED"] };
  } else if (filter === "pending") {
    advancedWhere.status = "OPEN";
    advancedWhere.bids = { some: {} };
  } else if (filter === "awaiting") {
    advancedWhere.status = "OPEN";
    advancedWhere.bids = { none: {} };
  } else if (filter === "confirmed") {
    advancedWhere.status = "ACCEPTED";
  } else if (filter === "completed") {
    advancedWhere.status = "COMPLETED";
  } else if (filter === "canceled") {
    advancedWhere.status = "CANCELED";
  } else if (filter === "upcoming") {
    advancedWhere.pickupTime = { gte: new Date() };
    advancedWhere.status = { in: ["OPEN", "ACCEPTED"] };
  }

 

  //pagination
   const totalCount = await prisma.advancedBooking.count({
    where: advancedWhere,
  });

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
    skip: (page - 1) * pageSize, 
    take: pageSize,               
  });
  


const totalPages = Math.ceil(totalCount / pageSize);
const [total, pending, awaiting, confirmed, upcoming, canceled, completed] = await Promise.all([
  prisma.advancedBooking.count({ 
    where: { 
      createdById: user.id,
      status: { in: ["OPEN", "ACCEPTED"] }
    } 
  }).catch(e => { console.error('Query 1 failed:', e.message); throw e; }),
  
  prisma.advancedBooking.count({
    where: { createdById: user.id, status: "OPEN", bids: { some: {} } },
  }).catch(e => { console.error('Query 2 failed:', e.message); throw e; }),
  
  prisma.advancedBooking.count({
    where: { createdById: user.id, status: "OPEN", bids: { none: {} } },
  }).catch(e => { console.error('Query 3 failed:', e.message); throw e; }),
  
  prisma.advancedBooking.count({
    where: { createdById: user.id, status: "ACCEPTED" },
  }).catch(e => { console.error('Query 4 failed:', e.message); throw e; }),
  
  prisma.advancedBooking.count({
    where: {
      createdById: user.id,
      pickupTime: { gte: new Date() },
      status: { in: ["OPEN", "ACCEPTED"] },
    },
  }).catch(e => { console.error('Query 5 failed:', e.message); throw e; }),
  
  prisma.advancedBooking.count({
    where: { createdById: user.id, status: "CANCELED" },
  }).catch(e => { console.error('Query 6 failed (CANCELED):', e.message); throw e; }),
  
  prisma.advancedBooking.count({
    where: { createdById: user.id, status: "COMPLETED" },
  }).catch(e => { console.error('Query 7 failed (COMPLETED):', e.message); throw e; }),
]);

  counts = { all: total, pending, awaiting, confirmed, upcoming, canceled, completed };

   return (
    <AllBookingsListClient
      bookings={bookings}
      counts={counts}
      currentFilter={filter}
      currentSearch={search}
      bookingType={bookingType}
      currentPage={page}    
      totalPages={totalPages}
    />
  );
} else {
  // Instant bookings
  const instantWhere = { ...baseWhere };

    if (filter === "all") {
    
    instantWhere.status = { in: ["PENDING", "ACCEPTED"] };
  } else if (filter === "confirmed") {
    instantWhere.status = "ACCEPTED";
  } else if (filter === "completed") {
    instantWhere.status = "COMPLETED";
  } else if (filter === "canceled") {
    instantWhere.status = "CANCELED";
  } else if (filter === "upcoming") {
    instantWhere.pickupTime = { gte: new Date() };
    instantWhere.status = { in: ["PENDING", "ACCEPTED"] };
  }



  const totalCount = await prisma.instantBooking.count({
    where: instantWhere,
  });

  bookings = await prisma.instantBooking.findMany({
  where: instantWhere,
  include: {
    accessibilityProfile: true,
    driver: {
      include: {
        user: {
          select: { name: true, email: true, phone: true },
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
  const [total, confirmed, upcoming, canceled, completed] = await Promise.all([
      prisma.instantBooking.count({ 
    where: { 
      createdById: user.id,
      status: { in: ["PENDING", "ACCEPTED"] } 
    } 
  }),
    prisma.instantBooking.count({
      where: { createdById: user.id, status: "ACCEPTED" },
    }),
    prisma.instantBooking.count({
      where: {
        createdById: user.id,
        pickupTime: { gte: new Date() },
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    }),
      prisma.instantBooking.count({
    where: { createdById: user.id, status: "CANCELED" },
  }),
  prisma.instantBooking.count({
    where: { createdById: user.id, status: "COMPLETED" },
  }),
  ]);

  counts = { all: total, pending: 0, awaiting: 0, confirmed, upcoming, canceled, completed };
  return (
      <AllBookingsListClient
        bookings={bookings}
        counts={counts}
        currentFilter={filter}
        currentSearch={search}
        bookingType={bookingType}
        currentPage={page}
        totalPages={totalPages}
      />
    );
}

}