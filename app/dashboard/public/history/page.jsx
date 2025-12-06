// app/dashboard/public/history/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PublicHistoryClient from "@/components/dashboard/public/publicHistoryClient";

export const metadata = {
  title: "Booking History - My Journeys",
  description: "View your past transport bookings",
};

export default async function PublicHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PUBLIC") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // Get all bookings (past and present)
  const bookings = await prisma.booking.findMany({
    where: {
      createdById: user.id,
    },
    include: {
      accessibilityProfile: true,
      bids: {
        where: { status: "PENDING" },
        select: {
          id: true,
          amountCents: true,
        },
      },
      acceptedBid: {
        include: {
          driver: {
            select: {
              name: true,
              vehicleClass: true,
            },
          },
        },
      },
    },
    orderBy: {
      pickupTime: "desc",
    },
  });

  // Separate into categories
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter(
    (b) =>
      new Date(b.pickupTime) >= today &&
      ["OPEN", "ACCEPTED", "SCHEDULED"].includes(b.status)
  );

  const past = bookings.filter(
    (b) =>
      new Date(b.pickupTime) < today ||
      ["COMPLETED", "CANCELED", "CLOSED"].includes(b.status)
  );

  return (
    <PublicHistoryClient
      user={user}
      upcomingBookings={upcoming}
      pastBookings={past}
    />
  );
}