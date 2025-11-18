// app/api/bookings/advanced/complete/route.js
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

    // Verify booking and accepted bid
    const booking = await prisma.advancedBooking.findUnique({
      where: { id: bookingId },
      include: {
        acceptedBid: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking.acceptedBid || booking.acceptedBid.driverId !== user.driver.id) {
      return NextResponse.json(
        { success: false, error: "You are not assigned to this booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Booking is not in accepted status" },
        { status: 400 }
      );
    }

    // Mark as completed
    await prisma.advancedBooking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
      },
    });

   

    return NextResponse.json({
      success: true,
      message: "Booking completed successfully",
    });
  } catch (error) {
    console.error("Error completing advanced booking:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}