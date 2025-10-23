// app/api/bookings/[id]/cancel/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Allow both MANAGER and PUBLIC users
    if (!session || !["MANAGER", "PUBLIC"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get booking with bids
    const booking = await prisma.advancedBooking.findUnique({
      where: { id },
      include: {
        bids: {
          where: { status: "PENDING" },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not your booking" },
        { status: 403 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel completed booking" },
        { status: 400 }
      );
    }

    if (booking.status === "CANCELED") {
      return NextResponse.json(
        { success: false, error: "Booking already cancelled" },
        { status: 400 }
      );
    }

    // Use transaction to cancel booking and reject all bids
    await prisma.$transaction(async (tx) => {
      // 1. Update booking status
      await tx.advancedBooking.update({
        where: { id },
        data: {
          status: "CANCELED",
        },
      });

      // 2. Reject all pending bids
      if (booking.bids.length > 0) {
        await tx.bid.updateMany({
          where: {
            advancedBookingId: id,
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
          },
        });
      }
    });

    // TODO: Send notifications to driver (if assigned) and bidders

    return NextResponse.json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}