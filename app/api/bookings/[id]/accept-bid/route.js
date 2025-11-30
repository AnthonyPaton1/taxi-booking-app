// app/api/bookings/accept-bid/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";


export async function GET() {
  return NextResponse.json({ message: "Route is working" });
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "PUBLIC"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, bidId } = body;

    if (!bookingId || !bidId) {
      return NextResponse.json(
        { success: false, error: "Missing bookingId or bidId" },
        { status: 400 }
      );
    }

    // Verify the manager owns this booking
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    //  Get unified booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bids: {
          where: { id: bidId },
          include: {
            driver: true,  
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - you don't own this booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "PENDING") {  
      return NextResponse.json(
        { success: false, error: "Booking is not open for bids" },
        { status: 400 }
      );
    }

    const bid = booking.bids[0];
    if (!bid) {
      return NextResponse.json(
        { success: false, error: "Bid not found" },
        { status: 404 }
      );
    }

    //  Accept the bid using a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the booking status and assign driver
      await tx.booking.update({ 
        where: { id: bookingId },
        data: {
          status: "BID_ACCEPTED",  
          acceptedBidId: bidId,
          driverId: bid.driverId,  
          acceptedAt: new Date(),
        },
      });

      // 2. Update the accepted bid status
      await tx.bid.update({
        where: { id: bidId },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      // 3. Reject all other bids for this booking
      await tx.bid.updateMany({
        where: {
          bookingId: bookingId, 
          id: { not: bidId },
          status: "PENDING", 
        },
        data: {
          status: "REJECTED",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Bid accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting bid:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}