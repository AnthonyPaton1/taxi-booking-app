// app/actions/bookings/bidActions.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Create a bid on a booking
 */
export async function createBid(input) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { bookingId, amountCents, message, etaMinutes, vehicleNotes } = input;

    // Validate input
    if (!bookingId || !amountCents) {
      return { success: false, error: "Missing required fields" };
    }

    if (amountCents < 0) {
      return { success: false, error: "Bid amount must be positive" };
    }

    // Get driver profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { driver: true },
    });

    if (!user?.driver) {
      return { success: false, error: "No driver profile found" };
    }

    if (!user.driver.approved) {
      return { success: false, error: "Driver not approved yet" };
    }

    // Check if ride exists and is still open
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        acceptedBidId: true,
        deletedAt: true,
      },
    });

    if (!booking || booking.deletedAt) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status !== "PENDING") {
      return { success: false, error: "Booking is no longer open for bidding" };
    }

    if (booking.acceptedBidId) {
      return { success: false, error: "Booking already has an accepted bid" };
    }

    // Check if driver already bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        bookingId,
        driverId: user.driver.id,
        status: "PENDING",
      },
    });

    if (existingBid) {
      return { success: false, error: "You've already placed a bid on this booking" };
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        bookingId,
        driverId: user.driver.id,
        amountCents,
        message: message || null,
        etaMinutes: etaMinutes || null,
        vehicleNotes: vehicleNotes || null,
        status: "PENDING",
      },
    });

    console.log("✅ Bid created:", bid.id);

    return { success: true, bid };
  } catch (error) {
    console.error("❌ Error creating bid:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all bids for a booking
 */
export async function getBidsForBooking(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const bids = await prisma.bid.findMany({
      where: {
        bookingId,
        deletedAt: null,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            vehicleClass: true,
            vehicleReg: true,
            phone: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { amountCents: "asc" }, // Lowest bid first
    });

    return { success: true, bids };
  } catch (error) {
    console.error("❌ Error fetching bids:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete/withdraw a bid (only if still pending)
 */
export async function deleteBid(bidId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get bid
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        booking: {
          select: {
            status: true,
            acceptedBidId: true,
          },
        },
        driver: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!bid) {
      return { success: false, error: "Bid not found" };
    }

    // Check ownership
    if (bid.driver.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Can only delete pending bids
    if (bid.status !== "PENDING") {
      return { success: false, error: "Cannot delete a bid that's been accepted or declined" };
    }

    // Soft delete
    await prisma.bid.update({
      where: { id: bidId },
      data: { deletedAt: new Date() },
    });

    console.log("✅ Bid deleted:", bidId);

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting bid:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Accept a bid (Manager approves winning bid)
 */
export async function acceptBid(bidId, bookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        createdBy: true,
        bids: {
          where: { id: bidId },
          include: {
            driver: true,
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Check if user is the creator
    if (booking.createdById !== session.user.id) {
      return { success: false, error: "Only the booking creator can accept bids" };
    }

    if (booking.bids.length === 0) {
      return { success: false, error: "Bid not found" };
    }

    const bid = booking.bids[0];

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Accept the winning bid
      await tx.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      });

      // Decline all other bids
      await tx.bid.updateMany({
        where: {
          bookingId,
          id: { not: bidId },
          status: "PENDING",
        },
        data: { status: "DECLINED" },
      });

      // Update booking - set status to BID_ACCEPTED and assign driver
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "BID_ACCEPTED",
          acceptedBidId: bidId,
          driverId: bid.driver.id,
        },
      });
    });

    console.log("✅ Bid accepted:", bidId);

    return { success: true };
  } catch (error) {
    console.error("❌ Error accepting bid:", error);
    return { success: false, error: error.message };
  }
}