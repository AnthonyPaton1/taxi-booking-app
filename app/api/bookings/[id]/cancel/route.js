// app/api/bookings/[id]/cancel/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "PUBLIC"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    // ✅ Get booking with bids
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true } },
        bids: {
          where: { status: "PENDING" },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Only creator can cancel
    if (booking.createdBy.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own bookings" },
        { status: 403 }
      );
    }

    // Can't cancel if completed
    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel completed booking" },
        { status: 400 }
      );
    }

    // Can't cancel if already cancelled
    if (booking.status === "CANCELED") {
      return NextResponse.json(
        { error: "Booking already cancelled" },
        { status: 400 }
      );
    }

    // ✅ Update with reason
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELED",
          canceledAt: new Date(),
          canceledBy: "MANAGER",  // ✅ Track who cancelled
          cancellationReason: reason || null,
        },
      });

      // Reject all pending bids
      if (booking.bids.length > 0) {
        await tx.bid.updateMany({
          where: {
            bookingId: id,  // ✅ Changed
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // ✅ Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true } },
        accessibilityProfile: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Only creator can edit
    if (existingBooking.createdBy.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own bookings" },
        { status: 403 }
      );
    }

    // Can't edit if bid already accepted
    if (existingBooking.acceptedBidId) {
      return NextResponse.json(
        { error: "Cannot edit booking - a bid has already been accepted" },
        { status: 400 }
      );
    }

    // ✅ Update accessibility profile
    await prisma.accessibilityProfile.update({
      where: { id: existingBooking.accessibilityProfileId },
      data: {
        ambulatoryPassengers: body.accessibilityProfile.passengerCount,
        wheelchairUsersStaySeated: body.accessibilityProfile.wheelchairUsers || body.accessibilityProfile.wheelchairUsersStaySeated,
        wheelchairUsersCanTransfer: body.accessibilityProfile.wheelchairUsersCanTransfer ?? 0,
        highRoof: body.accessibilityProfile.highRoof,
        carerPresent: body.accessibilityProfile.carerPresent,
        femaleDriverOnly: body.accessibilityProfile.femaleDriverOnly,
        quietEnvironment: body.accessibilityProfile.quietEnvironment,
        assistanceRequired: body.accessibilityProfile.assistanceRequired,
        noConversation: body.accessibilityProfile.noConversation,
        visualSchedule: body.accessibilityProfile.visualSchedule,
        assistanceAnimal: body.accessibilityProfile.assistanceAnimal,
        familiarDriverOnly: body.accessibilityProfile.familiarDriverOnly,
        escortRequired: body.accessibilityProfile.escortRequired,
        signLanguageRequired: body.accessibilityProfile.signLanguageRequired,
        textOnlyCommunication: body.accessibilityProfile.textOnlyCommunication,
        medicationOnBoard: body.accessibilityProfile.medicationOnBoard,
        mobilityAidStorage: body.accessibilityProfile.mobilityAidStorage,
        electricScooterStorage: body.accessibilityProfile.electricScooterStorage,
        additionalNeeds: body.accessibilityProfile.additionalNeeds,
      },
    });

    // ✅ Update booking details
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        pickupLocation: body.pickupLocation,
        dropoffLocation: body.dropoffLocation,
        pickupTime: new Date(body.pickupTime),
        returnTime: body.returnTime ? new Date(body.returnTime) : null,
      },
    });

    return NextResponse.json(
      { success: true, booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}