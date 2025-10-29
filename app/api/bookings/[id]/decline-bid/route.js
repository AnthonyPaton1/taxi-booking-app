// app/api/bookings/decline-bid/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Allow both MANAGER and PUBLIC users
    if (!session || !["MANAGER", "PUBLIC"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bidId } = body;

    if (!bidId) {
      return NextResponse.json(
        { success: false, error: "Missing bidId" },
        { status: 400 }
      );
    }

    // Get bid with booking to verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        booking: {
          select: {
            createdById: true,
            status: true,
          },
        },
      },
    });

    if (!bid) {
      return NextResponse.json(
        { success: false, error: "Bid not found" },
        { status: 404 }
      );
    }

    if (bid.booking.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not your booking" },
        { status: 403 }
      );
    }

    if (bid.booking.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Booking is not open" },
        { status: 400 }
      );
    }

    // Update bid status to rejected
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: "REJECTED" },
    });

    // TODO: Send notification to driver

    return NextResponse.json({
      success: true,
      message: "Bid declined",
    });
  } catch (error) {
    console.error("Error declining bid:", error);
    return NextResponse.json(
      { success: false, error: "Failed to decline bid" },
      { status: 500 }
    );
  }
}