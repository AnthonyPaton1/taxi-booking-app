// app/dashboard/public/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PublicBookingDetailClient from "@/components/dashboard/public/publicBookingDetailClient";

export const metadata = {
  title: "Booking Details - Review Bids",
  description: "View your booking details and accept driver bids",
};

export default async function PublicBookingDetailPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PUBLIC") {
    redirect("/login");
  }

  const { id } = params;

  // Fetch booking with all bids
  const booking = await prisma.advancedBooking.findUnique({
    where: { id },
    include: {
      accessibilityProfile: true,
      bids: {
        include: {
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          amountCents: "asc", // Lowest bid first
        },
      },
      acceptedBid: {
        include: {
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Verify this booking belongs to the logged-in user
  if (booking.createdById !== session.user.id) {
    redirect("/dashboard/public");
  }

  return <PublicBookingDetailClient booking={booking} />;
}