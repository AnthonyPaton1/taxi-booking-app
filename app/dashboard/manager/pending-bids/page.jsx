// app/dashboard/manager/pending-bids/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PendingBidsClient from "@/components/dashboard/business/pendingBidsClient";

export default async function PendingBidsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Fetch all bookings that have pending bids
  const bookingsWithBids = await prisma.advancedBooking.findMany({
    where: {
      createdById: user.id,
      status: "OPEN",
      bids: {
        some: {
          status: "PENDING",
        },
      },
    },
    include: {
      bids: {
        where: {
          status: "PENDING",
        },
        include: {
          driver: {
            select: {
              name: true,
              vehicleClass: true,
              phone: true,
            },
          },
        },
        orderBy: {
          amountCents: "asc", // Show lowest bid first
        },
      },
    },
    orderBy: {
      pickupTime: "asc", // Earliest bookings first
    },
  });

  // Calculate total bids count
  const totalBids = bookingsWithBids.reduce(
    (sum, booking) => sum + booking.bids.length,
    0
  );

  return (
    <PendingBidsClient
      bookings={bookingsWithBids}
      totalBids={totalBids}
    />
  );
}