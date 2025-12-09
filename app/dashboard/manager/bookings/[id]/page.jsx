// app/dashboard/manager/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SingleBookingClient from "@/components/dashboard/business/singleBookingClient";  

export default async function SingleBookingPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;

  //  Fetch unified booking
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      business: true,
      accessibilityProfile: true,
      driver: {
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      },
      bids: {
        where: {
          status: {
            in: ["PENDING", "ACCEPTED"]
          }
        },
        include: {
          driver: {
            select: {
              id: true,
              vehicleClass: true,
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
          amountCents: "asc",
        },
      },
      acceptedBid: {
        include: {
          driver: {
            select: {
              id: true,
              vehicleClass: true,
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
      <SingleBookingClient booking={booking} />
    </div>
  );
}