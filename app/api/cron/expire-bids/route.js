// app/api/cron/expire-bids/route.js
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function GET(req) {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("🕐 Running bid expiration cron job...");

    // Find expired bids
    const expiredBids = await prisma.bid.findMany({
      where: {
        status: 'ACCEPTED',
        expiresAt: { lt: new Date() }
      },
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

    console.log(`Found ${expiredBids.length} expired bids`);

    let processedCount = 0;

    for (const bid of expiredBids) {
      try {
        // Mark bid as expired
        await prisma.bid.update({
          where: { id: bid.id },
          data: { status: 'EXPIRED' }
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
          subject: "⚠️ Driver Did Not Confirm - Booking Reopened",
          html: `
            <h2>Driver Did Not Confirm</h2>
            <p>${bid.driver.name} did not confirm the booking within 24 hours:</p>
            <ul>
              <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
              <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
              <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
              <li><strong>Time:</strong> ${bid.booking.pickupTime}</li>
            </ul>
            <p>Your booking is now <strong>OPEN</strong> again and available for new bids.</p>
            <p>Other drivers who previously bid will be notified that the booking is available again.</p>
            <p><a href="${BASE_URL}/dashboard/manager/bookings/${bid.bookingId}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a></p>
            <p>Or create an instant booking if this is urgent:</p>
            <p><a href="${BASE_URL}/dashboard/manager/bookings/instant/new">Create Instant Booking</a></p>
          `
        });

        // Notify other bidders that booking is available again
        const otherBids = await prisma.bid.findMany({
          where: {
            bookingId: bid.bookingId,
            status: 'REJECTED',
            id: { not: bid.id }
          },
          include: {
            driver: { include: { user: true } }
          }
        });

        for (const otherBid of otherBids) {
          await sendEmail({
            to: otherBid.driver.user.email,
            subject: "Booking Available Again",
            html: `
              <h2>Booking Available Again</h2>
              <p>A booking you previously bid on is now available again:</p>
              <ul>
                <li><strong>Pickup:</strong> ${bid.booking.pickupLocation}</li>
                <li><strong>Dropoff:</strong> ${bid.booking.dropoffLocation}</li>
                <li><strong>Date:</strong> ${bid.booking.pickupDate}</li>
                <li><strong>Time:</strong> ${bid.booking.pickupTime}</li>
              </ul>
              <p>The previously accepted driver did not confirm within 24 hours.</p>
              <p><a href="${BASE_URL}/dashboard/driver/bookings/${bid.bookingId}">View Booking & Bid</a></p>
            `
          });
        }

        processedCount++;
        console.log(`✅ Expired bid ${bid.id} - reopened booking ${bid.bookingId}`);
      } catch (error) {
        console.error(`❌ Failed to process bid ${bid.id}:`, error);
      }
    }

    console.log(`✅ Cron job complete: ${processedCount}/${expiredBids.length} bids processed`);

    return Response.json({
      success: true,
      processed: processedCount,
      total: expiredBids.length
    });
  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}