// app/api/bids/place/route.js
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
    const { advancedBookingId, amountCents, message } = body;

    if (!advancedBookingId || !amountCents || amountCents <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid bid details" },
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

    // Check if booking exists and is still open
    const booking = await prisma.advancedBooking.findUnique({
      where: { id: advancedBookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Booking is no longer accepting bids" },
        { status: 400 }
      );
    }

    // Check if driver already has a pending bid on this booking
    const existingBid = await prisma.bid.findFirst({
      where: {
        advancedBookingId,
        driverId: user.driver.id,
        status: "PENDING",
      },
    });

    if (existingBid) {
      return NextResponse.json(
        { success: false, error: "You already have a bid on this booking" },
        { status: 400 }
      );
    }

    // Create the bid
    const bid = await prisma.bid.create({
      data: {
        amountCents,
        message: message || null,
        status: "PENDING",
         advancedBooking: {
      connect: { id: advancedBookingId },
    },
    user: {
      connect: { id: session.user.id },  
    },
    driver: {
      connect: { id: user.driver.id },   
    },
      },
    });


    return NextResponse.json({
      success: true,
      bid,
      message: "Bid placed successfully",
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}