// app/dashboard/manager/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SingleBookingClient from "@/components/dashboard/business/singleAdvancedBookingClient";
import SingleInstantBookingClient from "@/components/dashboard/business/singleInstantBookingClient";

export default async function SingleBookingPage({ params, searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const bookingType = resolvedSearchParams?.type || "advanced";

  let booking = null;

  if (bookingType === "instant") {
    // Fetch instant booking - FIXED: using instantBooking model
    booking = await prisma.instantBooking.findUnique({
      where: { id },
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
    });
  } else {
    // Fetch advanced booking
    booking = await prisma.advancedBooking.findUnique({
      where: { id },
      include: {
        accessibilityProfile: true,
        bids: {
          include: {
            driver: {
              select: {
                vehicleType: true,
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
                vehicleType: true,
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
}
    })
  }


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
      {bookingType === "instant" ? (
        <SingleInstantBookingClient booking={booking} />
      ) : (
        <SingleBookingClient booking={booking} bookingType={bookingType} />
      )}
    </div>
  );
}