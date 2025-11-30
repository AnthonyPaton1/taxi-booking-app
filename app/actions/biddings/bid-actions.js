// app/actions/bidding/bidActions.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// 1. Manager accepts a bid
export async function acceptBid(bidId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        driver: { include: { user: true } },
        booking: { 
          include: { 
            house: { include: { business: true } },
            resident: true
          }
        }
      }
    });

    if (!bid) {
      return { success: false, error: "Bid not found" };
    }

    // Check authorization (must be manager of the business)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { business: true }
    });

    if (!user || user.businessId !== bid.booking.house.businessId) {
      return { success: false, error: "Unauthorized" };
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update bid
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        expiresAt: expiresAt
      }
    });

    // Update booking
    await prisma.advancedBooking.update({
      where: { id: bid.bookingId },
      data: {
        status: 'BID_ACCEPTED',
        acceptedBidId: bidId
      }
    });

    // Reject other bids
    await prisma.bid.updateMany({
      where: {
        bookingId: bid.bookingId,
        id: { not: bidId }
      },
      data: { status: 'REJECTED' }
    });

    // Send email to driver
    await sendEmail({
      to: bid.driver.user.email,
      subject: "🎉 Your Bid Was Accepted!",
      html: `
        <h2>Great news, ${bid.driver.name}!</h2>
        <p>Your bid of £${bid.price} was accepted for:</p>
        <ul>
          <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
          <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
          <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
          <li><strong>Time:</strong> ${bid.booking.pickupTime}</li>
          <li><strong>Passengers:</strong> ${bid.booking.passengerCount}</li>
        </ul>
        <p><strong>⏰ You have 24 hours to confirm this booking.</strong></p>
        <p>Expires: ${expiresAt.toLocaleString()}</p>
        <p><a href="${BASE_URL}/dashboard/driver/bids/${bidId}/confirm" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Booking</a></p>
        <p>If you don't confirm within 24 hours, this booking will be reopened to other drivers.</p>
      `
    });

    // Send confirmation to manager
    await sendEmail({
      to: session.user.email,
      subject: "Bid Accepted - Awaiting Driver Confirmation",
      html: `
        <h2>Bid Accepted</h2>
        <p>You accepted ${bid.driver.name}'s bid of £${bid.price} for:</p>
        <ul>
          <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
          <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
          <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
          <li><strong>Time:</strong> ${bid.booking.pickupTime}</li>
        </ul>
        <p>The driver has 24 hours to confirm. You'll receive an email once confirmed.</p>
      `
    });

    console.log("✅ Bid accepted:", bidId);

    return { success: true, expiresAt };
  } catch (error) {
    console.error("❌ Accept bid failed:", error);
    return { success: false, error: error.message };
  }
}

// 2. Driver confirms bid
export async function confirmBid(bidId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        driver: { include: { user: true } },
        booking: {
          include: {
            house: { include: { business: { include: { admin: true } } } },
            resident: true
          }
        }
      }
    });

    if (!bid) {
      return { success: false, error: "Bid not found" };
    }

    // Check driver owns this bid
    if (bid.driver.user.email !== session.user.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Check still within 24h window
    if (new Date() > bid.expiresAt) {
      return { success: false, error: "Confirmation window expired" };
    }

    // Confirm bid
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date()
      }
    });

    // Confirm booking
    await prisma.advancedBooking.update({
      where: { id: bid.bookingId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date()
      }
    });

    // Send confirmation to driver
    await sendEmail({
      to: bid.driver.user.email,
      subject: "✅ Booking Confirmed",
      html: `
        <h2>Booking Confirmed!</h2>
        <p>You've successfully confirmed the booking:</p>
        <ul>
          <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
          <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
          <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
          <li><strong>Time:</strong> ${bid.booking.pickupTime}</li>
          <li><strong>Payment:</strong> £${bid.price}</li>
        </ul>
        <p>This booking is now locked in. If you need to cancel due to illness or emergency, contact the manager immediately.</p>
        <p><a href="${BASE_URL}/dashboard/driver">View Your Dashboard</a></p>
      `
    });

    // Send confirmation to manager
    await sendEmail({
      to: bid.booking.house.business.admin.email,
      subject: "✅ Driver Confirmed Booking",
      html: `
        <h2>Driver Confirmed</h2>
        <p>${bid.driver.name} has confirmed the booking:</p>
        <ul>
          <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
          <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
          <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
          <li><strong>Time:</strong> ${bid.booking.pickupTime}</li>
          <li><strong>Price:</strong> £${bid.price}</li>
        </ul>
        <p>The booking is now confirmed and locked in.</p>
        <p><a href="${BASE_URL}/dashboard/manager/bookings/${bid.bookingId}">View Booking</a></p>
      `
    });

    console.log("✅ Bid confirmed:", bidId);

    return { success: true };
  } catch (error) {
    console.error("❌ Confirm bid failed:", error);
    return { success: false, error: error.message };
  }
}

// 3. Driver withdraws bid (within 24h window - no penalty)
export async function withdrawBid(bidId, reason) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        driver: { include: { user: true } },
        booking: {
          include: {
            house: { include: { business: { include: { admin: true } } } }
          }
        }
      }
    });

    if (!bid) {
      return { success: false, error: "Bid not found" };
    }

    // Check driver owns this bid
    if (bid.driver.user.email !== session.user.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Check still within 24h window
    if (new Date() > bid.expiresAt) {
      return { success: false, error: "Withdrawal window expired" };
    }

    // Withdraw bid
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'WITHDRAWN',
        canceledAt: new Date(),
        cancellationReason: reason
      }
    });

    // Reopen booking
    await prisma.advancedBooking.update({
      where: { id: bid.bookingId },
      data: {
        status: 'OPEN',
        acceptedBidId: null
      }
    });

    // Notify manager
    await sendEmail({
      to: bid.booking.house.business.admin.email,
      subject: "Driver Withdrew Bid - Booking Reopened",
      html: `
        <h2>Driver Withdrew Bid</h2>
        <p>${bid.driver.name} withdrew their bid for:</p>
        <ul>
          <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
          <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
          <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
        </ul>
        <p><strong>Reason:</strong> ${reason || 'Not provided'}</p>
        <p>The booking is now open for new bids.</p>
        <p><a href="${BASE_URL}/dashboard/manager/bookings/${bid.bookingId}">View Booking</a></p>
      `
    });

    console.log("✅ Bid withdrawn:", bidId);

    return { success: true };
  } catch (error) {
    console.error("❌ Withdraw bid failed:", error);
    return { success: false, error: error.message };
  }
}

// 4. Cancel booking (legitimate reasons - no penalty)
export async function cancelBooking(bookingId, canceledBy, reason) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const booking = await prisma.advancedBooking.findUnique({
      where: { id: bookingId },
      include: {
        acceptedBid: {
          include: {
            driver: { include: { user: true } }
          }
        },
        house: { include: { business: { include: { admin: true } } } }
      }
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Authorization check
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { driver: true }
    });

    const isManager = user.businessId === booking.house.businessId;
    const isDriver = user.driver?.id === booking.acceptedBid?.driverId;

    if (!isManager && !isDriver) {
      return { success: false, error: "Unauthorized" };
    }

    // Update booking
    await prisma.advancedBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        canceledBy,
        cancellationReason: reason
      }
    });

    // Update bid if exists
    if (booking.acceptedBid) {
      await prisma.bid.update({
        where: { id: booking.acceptedBid.id },
        data: {
          status: canceledBy === 'MANAGER' ? 'CANCELED_MANAGER' : 'CANCELED_DRIVER',
          canceledAt: new Date(),
          canceledBy,
          cancellationReason: reason
        }
      });
    }

    // Send notifications
    if (canceledBy === 'DRIVER' && booking.acceptedBid) {
      // Driver canceled - notify manager
      await sendEmail({
        to: booking.house.business.admin.email,
        subject: "Driver Canceled Booking",
        html: `
          <h2>Booking Canceled</h2>
          <p>${booking.acceptedBid.driver.name} has canceled the booking:</p>
          <ul>
            <li><strong>Pickup:</strong> ${booking.pickupLocation}</li>
            <li><strong>Dropoff:</strong> ${booking.dropoffLocation}</li>
            <li><strong>Date:</strong> ${booking.pickupDate}</li>
            <li><strong>Time:</strong> ${booking.pickupTime}</li>
          </ul>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li><a href="${BASE_URL}/dashboard/manager/bookings/instant/new">Create Instant Booking</a> (if urgent)</li>
            <li><a href="${BASE_URL}/dashboard/manager/bookings/advanced/new">Create Advanced Booking</a> (if time permits)</li>
          </ul>
        `
      });
    } else if (canceledBy === 'MANAGER' && booking.acceptedBid) {
      // Manager canceled - notify driver
      await sendEmail({
        to: booking.acceptedBid.driver.user.email,
        subject: "Booking Canceled by Manager",
        html: `
          <h2>Booking Canceled</h2>
          <p>The following booking has been canceled:</p>
          <ul>
            <li><strong>Pickup:</strong> ${booking.pickupLocation}</li>
            <li><strong>Dropoff:</strong> ${booking.dropoffLocation}</li>
            <li><strong>Date:</strong> ${booking.pickupDate}</li>
            <li><strong>Time:</strong> ${booking.pickupTime}</li>
          </ul>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>This cancellation will not affect your rating or standing.</p>
          <p><a href="${BASE_URL}/dashboard/driver/bookings">View Available Bookings</a></p>
        `
      });
    }

    console.log("✅ Booking canceled:", bookingId);

    return { success: true };
  } catch (error) {
    console.error("❌ Cancel booking failed:", error);
    return { success: false, error: error.message };
  }
}

// 5. Get driver's pending confirmations
export async function getDriverPendingConfirmations() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { driver: true }
    });

    if (!user?.driver) {
      return { success: false, error: "Not a driver" };
    }

    const pendingBids = await prisma.bid.findMany({
      where: {
        driverId: user.driver.id,
        status: 'ACCEPTED',
        expiresAt: { gt: new Date() }
      },
      include: {
        booking: {
          include: {
            house: true,
            resident: true
          }
        }
      },
      orderBy: { expiresAt: 'asc' }
    });

    return { success: true, bids: pendingBids };
  } catch (error) {
    console.error("❌ Get pending confirmations failed:", error);
    return { success: false, error: error.message };
  }
}
