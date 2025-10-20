// app/dashboard/manager/instant-bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SingleInstantBookingClient from "@/components/dashboard/business/singleInstantBookingClient";

export default async function SingleInstantBookingPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = params;

  // Fetch booking with all related data
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      resident: {
        include: {
          house: true,
        },
      },
      assignedDriver: {
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
  });

  if (!booking) {
    notFound();
  }

  // Verify the manager owns this booking
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (booking.createdById !== user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <SingleInstantBookingClient booking={booking} />
    </div>
  );
}