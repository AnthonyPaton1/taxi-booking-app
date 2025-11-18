// app/api/bookings/instant/[id]/cancel/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";


export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: bookingId } = params;

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const booking = await prisma.instantBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a completed booking" },
        { status: 400 }
      );
    }

    if (booking.status === "CANCELED") {
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Cancel the booking
    await prisma.instantBooking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELED",
      },
    });

    

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling instant booking:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}