// app/api/bookings/instant/[id]/accept/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get driver
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return NextResponse.json(
        { success: false, error: "Driver profile not found" },
        { status: 404 }
      );
    }

    // Check if booking exists and is still available
    const booking = await prisma.instantBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Booking is no longer available" },
        { status: 400 }
      );
    }

    // Assign the driver to the booking
    await prisma.instantBooking.update({
      where: { id: bookingId },
      data: {
        status: "ACCEPTED",
        driverId: user.driver.id,
        acceptedAt: new Date(),
      },
    });

    

    return NextResponse.json({
      success: true,
      message: "Booking accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting instant booking:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}