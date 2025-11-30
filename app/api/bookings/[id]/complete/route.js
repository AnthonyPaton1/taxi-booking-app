// app/api/bookings/[id]/complete/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: bookingId } = await params;  // ✅ Get from params instead of body

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

    // ✅ Verify booking
    const booking = await prisma.booking.findUnique({
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

    // ✅ Verify driver is assigned to this booking
    if (booking.driverId !== user.driver.id) {
      return NextResponse.json(
        { success: false, error: "You are not assigned to this booking" },
        { status: 403 }
      );
    }

    // ✅ Check status - can complete from ACCEPTED or IN_PROGRESS
    if (!["ACCEPTED", "BID_ACCEPTED", "IN_PROGRESS"].includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot complete booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // ✅ Mark as completed
    await prisma.booking.update({
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
    console.error("Error completing booking:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}