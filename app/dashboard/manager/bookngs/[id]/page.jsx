// app/dashboard/manager/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SingleBookingClient from "@/components/dashboard/business/singleBookingClient";

export default async function SingleBookingPage({ params }) {
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
          amount: "asc", // Lowest bid first
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <SingleBookingClient booking={booking} />
    </div>
  );
}