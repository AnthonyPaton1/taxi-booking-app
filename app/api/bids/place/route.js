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
    const { bookingId, amountCents, message } = body;

    console.log("📥 Bid request received:", {
      bookingId,
      amountCents,
      amountType: typeof amountCents,
      message,
      fullBody: body
    });

    if (!bookingId || !amountCents || amountCents <= 0) {
      console.log("❌ Validation failed:", { bookingId, amountCents });
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

    // Check if booking exists and is still accepting bids
    const booking = await prisma.booking.findUnique({
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
        { success: false, error: "Booking is no longer accepting bids" },
        { status: 400 }
      );
    }

    // Check if driver already has a pending bid on this booking
    const existingBid = await prisma.bid.findFirst({
      where: {
        bookingId,
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

    // ✅ Create the bid with all required fields
    const bid = await prisma.bid.create({
      data: {
        amountCents,
        message: message || null,
        status: "PENDING",
        userId: user.id,          
        bookingId: bookingId,      
        driverId: user.driver.id,  
      },
    });

    console.log("✅ Bid created successfully:", bid.id);

    return NextResponse.json({
      success: true,
      bid,
      message: "Bid placed successfully",
    });
  } catch (error) {
    console.error("💥 Error placing bid:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}