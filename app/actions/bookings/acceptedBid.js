// app/actions/bookings/acceptBid.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function acceptBid({ bookingId, bidId }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    // Verify bid exists and belongs to this booking
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
        booking: {
          include: {
            resident: true,
          },
        },
      },
    });

    if (!bid || bid.bookingId !== bookingId) {
      return { success: false, error: "Invalid bid" };
    }

    if (bid.booking.status !== "PENDING") {
      return { success: false, error: "Booking is not pending" };
    }

    if (bid.status !== "PENDING") {
      return { success: false, error: "Bid is no longer available" };
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Accept the winning bid
      await tx.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      });

      // 2. Reject all other bids for this booking
      await tx.bid.updateMany({
        where: {
          bookingId,
          id: { not: bidId },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      // 3. Update booking status and assign driver
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "ACCEPTED",
          driverId: bid.driverId,
          acceptedBidAmount: bid.amount,
        },
      });

      // 4. Create audit log
      await tx.auditLog.create({
        data: {
          action: "ACCEPT_BID",
          entityType: "BOOKING",
          entityId: bookingId,
          userId: session.user.id,
          details: {
            bookingId,
            bidId,
            driverId: bid.driverId,
            driverName: bid.driver.user.name,
            amount: bid.amount,
            residentName: bid.booking.resident.name,
            managerEmail: session.user.email,
          },
        },
      });
    });

    // TODO: Send notification to driver (email/SMS)
    // TODO: Send notification to rejected drivers
    // TODO: Send confirmation to manager

    return {
      success: true,
      message: `Bid accepted. ${bid.driver.user.name} has been assigned.`,
    };
  } catch (error) {
    console.error("❌ Error accepting bid:", error);
    return {
      success: false,
      error: error.message || "Failed to accept bid",
    };
  }
}