// app/actions/bookings/bidActions.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Create a bid on an advanced booking
 */
export async function createBid(input) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { advancedBookingId, amountCents, message, etaMinutes, vehicleNotes } = input;

    // Validate input
    if (!advancedBookingId || !amountCents) {
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
    const booking = await prisma.advancedBooking.findUnique({
      where: { id: advancedBookingId },
      select: {
        id: true,
        status: true,
        acceptedBidId: true,
        bidDeadline: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status !== "OPEN") {
      return { success: false, error: "Booking is no longer open for bidding" };
    }

    if (booking.acceptedBidId) {
      return { success: false, error: "Booking already has an accepted bid" };
    }

    if (booking.bidDeadline && new Date() > new Date(booking.bidDeadline)) {
      return { success: false, error: "Bid deadline has passed" };
    }

    // Check if driver already bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        advancedBookingId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingBid) {
      return { success: false, error: "You've already placed a bid on this booking" };
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        advancedBookingId,
        userId: session.user.id,
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
 * Get all bids for an advanced booking
 */
export async function getBidsForBooking(advancedBookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const bids = await prisma.bid.findMany({
      where: {
        advancedBookingId,
        deletedAt: null,
      },
      include: {
        driver: {
          select: {
            name: true,
            vehicleType: true,
            vehicleReg: true,
            phone: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
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
        advancedBooking: {
          select: {
            status: true,
            acceptedBidId: true,
          },
        },
      },
    });

    if (!bid) {
      return { success: false, error: "Bid not found" };
    }

    // Check ownership
    if (bid.userId !== session.user.id) {
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
export async function acceptBid(bidId, advancedBookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get booking
    const booking = await prisma.advancedBooking.findUnique({
      where: { id: advancedBookingId },
      include: {
        createdBy: true,
        bids: {
          where: { id: bidId },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Check if user is the creator (or manager of the business)
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
          advancedBookingId,
          id: { not: bidId },
          status: "PENDING",
        },
        data: { status: "DECLINED" },
      });

      // Update booking
      await tx.advancedBooking.update({
        where: { id: advancedBookingId },
        data: {
          status: "ACCEPTED",
          acceptedBidId: bidId,
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

/**
 * Accept an instant booking (Driver clicks "Accept")
 */
export async function acceptInstantBooking(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
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

    // Get booking
    const booking = await prisma.instantBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status !== "PENDING") {
      return { success: false, error: "Booking is no longer available" };
    }

    if (booking.driverId) {
      return { success: false, error: "Booking already accepted by another driver" };
    }

    // Accept booking
    await prisma.instantBooking.update({
      where: { id: bookingId },
      data: {
        status: "ACCEPTED",
        driverId: user.driver.id,
        acceptedAt: new Date(),
        acceptedByUserId: session.user.id,
      },
    });

    console.log("✅ Instant booking accepted:", bookingId);

    return { success: true };
  } catch (error) {
    console.error("❌ Error accepting booking:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark instant booking as in progress
 */
export async function startInstantBooking(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.instantBooking.findUnique({
      where: { id: bookingId },
      include: { driver: { include: { user: true } } },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.driver?.user.id !== session.user.id) {
      return { success: false, error: "Not your booking" };
    }

    if (booking.status !== "ACCEPTED") {
      return { success: false, error: "Booking must be accepted first" };
    }

    await prisma.instantBooking.update({
      where: { id: bookingId },
      data: { status: "IN_PROGRESS" },
    });

    console.log("✅ Booking started:", bookingId);

    return { success: true };
  } catch (error) {
    console.error("❌ Error starting booking:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete instant booking
 */
export async function completeInstantBooking(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.instantBooking.findUnique({
      where: { id: bookingId },
      include: { driver: { include: { user: true } } },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.driver?.user.id !== session.user.id) {
      return { success: false, error: "Not your booking" };
    }

    if (booking.status !== "IN_PROGRESS") {
      return { success: false, error: "Booking must be in progress" };
    }

    await prisma.instantBooking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    });

    console.log("✅ Booking completed:", bookingId);

    return { success: true };
  } catch (error) {
    console.error("❌ Error completing booking:", error);
    return { success: false, error: error.message };
  }
}