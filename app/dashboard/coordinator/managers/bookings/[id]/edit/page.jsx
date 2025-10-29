// app/dashboard/manager/bookings/[id]/edit/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import EditBookingForm from "@/components/forms/business/editBookingForm";

export default async function EditBookingPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const booking = await prisma.advancedBooking.findUnique({
    where: { id: params.id },
    include: {
      accessibilityProfile: true,
      createdBy: {
        select: { id: true, email: true },
      },
      bids: {
        select: { id: true, status: true },
      },
    },
  });

  if (!booking) {
    return <div className="p-6"><p className="text-red-600">Booking not found</p></div>;
  }

  // Only allow editing if no bids accepted yet
  if (booking.acceptedBidId) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Cannot edit booking - a bid has already been accepted.
        </p>
      </div>
    );
  }

  // Only creator can edit
  if (booking.createdBy.id !== session.user.id) {
    return (
      <div className="p-6">
        <p className="text-red-600">You can only edit your own bookings.</p>
      </div>
    );
  }

  // Get houses for the form
  const houses = await prisma.house.findMany({
    where: {
      managerId: session.user.id,
      deletedAt: null,
    },
    include: {
      residents: true,
    },
    orderBy: {
      label: "asc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <EditBookingForm booking={booking} houses={houses} />
    </div>
  );
}