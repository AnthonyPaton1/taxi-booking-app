// lib/notifications.js

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendSMS } from './sms';

// Notification types as constants
export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_AVAILABLE: 'BOOKING_AVAILABLE',
  BOOKING_ASSIGNED: 'BOOKING_ASSIGNED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  BID_RECEIVED: 'BID_RECEIVED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_REJECTED: 'BID_REJECTED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
};

// Map notification types to email preference fields
const NOTIFICATION_TO_PREF_MAP = {
  'BOOKING_AVAILABLE': 'bookingAvailable',
  'BID_ACCEPTED': 'bidAccepted',
  'BOOKING_ASSIGNED': 'bookingAssigned',
  'BOOKING_CANCELLED': 'bookingCancelled',
  'PAYMENT_RECEIVED': 'paymentReceived',
  'BID_RECEIVED': 'bookingAvailable',
  'BOOKING_CREATED': 'systemUpdates',
  'SYSTEM_ALERT': 'systemUpdates',
};

/**
 * Determine booking urgency based on pickup time
 */
export function getBookingUrgency(pickupTime) {
  const hoursUntilPickup = (new Date(pickupTime) - new Date()) / (1000 * 60 * 60);
  
  if (hoursUntilPickup < 0) {
    return 'EXPIRED';
  } else if (hoursUntilPickup <= 48) {
    return 'URGENT'; // SMS + Email
  } else {
    return 'STANDARD'; // Batch/Digest only
  }
}

export function isBookingUrgent(pickupTime) {
  return getBookingUrgency(pickupTime) === 'URGENT';
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  bookingId = null,
  bidId = null,
  payload = null,
  sendEmail: shouldSendEmail = true,
}) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        bookingId,
        bidId,
        payload: payload 
          ? JSON.stringify({ title, message, ...payload }) 
          : JSON.stringify({ title, message }),
      },
    });

    // Optionally send email
    if (shouldSendEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        await sendEmailNotification(
          user.email,
          user.name,
          title,
          message,
          type,
          bookingId
        );
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(notifications) {
  try {
    return await prisma.notification.createMany({
      data: notifications.map(n => ({
        ...n,
        payload: typeof n.payload === 'object' ? JSON.stringify(n.payload) : n.payload,
      })),
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId) {
  return await prisma.notification.findMany({
    where: {
      userId,
      readAt: null,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
    include: {
      booking: {
        select: {
          id: true,
          pickupLocation: true,
          dropoffLocation: true,
          pickupTime: true,
        },
      },
      bid: {
        select: {
          id: true,
          amountCents: true,
        },
      },
    },
  });
}

/**
 * Get all notifications for a user (paginated)
 */
export async function getUserNotifications(userId, { skip = 0, take = 20 } = {}) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { 
          userId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ 
        where: { 
          userId,
          readAt: null,
          deletedAt: null,
        } 
      }),
    ]);

    // Parse payload for each notification
    const parsedNotifications = notifications.map(n => ({
      ...n,
      payload: n.payload ? JSON.parse(n.payload) : null,
      read: !!n.readAt,
    }));

    return {
      notifications: parsedNotifications,
      unreadCount,
      hasMore: notifications.length === take,
    };
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    // Return empty data instead of throwing
    return {
      notifications: [],
      unreadCount: 0,
      hasMore: false,
    };
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, userId) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
      deletedAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

/**
 * Soft delete notification
 */
export async function deleteNotification(notificationId, userId) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Delete old read notifications (cleanup job - hard delete)
 */
export async function cleanupOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await prisma.notification.deleteMany({
    where: {
      readAt: {
        not: null,
      },
      createdAt: {
        lt: cutoffDate,
      },
    },
  });
}

/**
 * Send email notification (with preferences check)
 */
async function sendEmailNotification(email, name, title, message, type, bookingId = null) {
  try {
    // Get user by email to check preferences
    const user = await prisma.user.findUnique({
      where: { email },
      include: { emailPreferences: true }
    });

    if (!user) return;

    // Get preference field for this notification type
    const prefField = NOTIFICATION_TO_PREF_MAP[type];
    
    // Check if user has this notification type enabled (default to true if no prefs)
    const emailEnabled = user.emailPreferences?.[prefField] ?? true;

    if (!emailEnabled) {
      console.log(`User ${user.id} has email disabled for ${type}`);
      return;
    }

    // Check if they want digest instead of immediate (except urgent/important ones)
    if (
      user.emailPreferences?.emailDigest && 
      type !== NOTIFICATION_TYPES.BOOKING_ASSIGNED &&
      type !== NOTIFICATION_TYPES.PAYMENT_RECEIVED &&
      type !== NOTIFICATION_TYPES.BID_ACCEPTED
    ) {
      console.log(`User ${user.id} prefers digest, queueing notification`);
      // TODO: Queue for digest - for now, skip immediate email
      return;
    }

    // Generate unsubscribe token
    const unsubToken = generateUnsubscribeToken(user.id, type);
    const prefsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/notifications?token=${unsubToken}`;
    const bookingLink = bookingId 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}` 
      : null;

    await sendEmail({
      to: email,
      subject: `NEAT Transport: ${title}`,
      html: generateEmailHTML({
        name,
        title,
        message,
        bookingLink,
        prefsUrl
      })
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw - we don't want email failures to break the main flow
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML({ name, title, message, bookingLink, prefsUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">NEAT Transport</h1>
                  <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Accessible Transport Marketplace</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px;">${title}</h2>
                  
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 5px 0;">
                    Hi ${name},
                  </p>
                  
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    ${message}
                  </p>
                  
                  ${bookingLink ? `
                    <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td style="background-color: #667eea; border-radius: 6px; text-align: center;">
                          <a href="${bookingLink}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                            View Booking Details
                          </a>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    You can also view this notification in your 
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications" style="color: #667eea; text-decoration: none;">dashboard</a>.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef;">
                  <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                    This is an automated notification from NEAT Transport.
                  </p>
                  <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0;">
                    <a href="${prefsUrl}" style="color: #667eea; text-decoration: none; font-weight: 500;">Manage email preferences</a>
                    &nbsp;•&nbsp;
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications" style="color: #667eea; text-decoration: none; font-weight: 500;">View all notifications</a>
                  </p>
                </td>
              </tr>
              
            </table>
            
            <!-- Legal Footer -->
            <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
              <tr>
                <td style="text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} NEAT Transport. All rights reserved.</p>
                  <p style="margin: 0;">Stockport, England, UK</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate secure unsubscribe token
 */
function generateUnsubscribeToken(userId, notificationType) {
  const crypto = require('crypto');
  const secret = process.env.UNSUBSCRIBE_SECRET || 'change-this-in-production';
  const timestamp = Date.now();
  const data = `${userId}:${notificationType}:${timestamp}`;
  const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
  
  return Buffer.from(`${hash}:${userId}:${notificationType}:${timestamp}`).toString('base64');
}

/**
 * Verify unsubscribe token
 */
export function verifyUnsubscribeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [hash, userId, notificationType, timestamp] = decoded.split(':');
    
    // Optional: Check if token is too old (e.g., 30 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (tokenAge > maxAge) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { 
      valid: true, 
      userId, 
      notificationType 
    };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

// ============================================
// SPECIFIC NOTIFICATION CREATORS
// ============================================

/**
 * Notify drivers of new booking (with urgency detection)
 */
export async function notifyDriversOfNewBooking(booking) {
  const drivers = await prisma.user.findMany({
    where: {
      role: 'DRIVER',
      isApproved: true,
      areaId: booking.areaId,
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  const urgency = getBookingUrgency(booking.pickupTime);
  const title = urgency === 'URGENT' ? '🚨 URGENT: New Booking Available' : 'New Booking Available';
  const message = `New booking: ${booking.pickupLocation} to ${booking.dropoffLocation} at ${new Date(booking.pickupTime).toLocaleString()}`;

  // ✅ ALWAYS create in-app notifications
  const notifications = drivers.map((driver) => ({
    userId: driver.id,
    type: NOTIFICATION_TYPES.BOOKING_AVAILABLE,
    bookingId: booking.id,
    payload: JSON.stringify({ title, message }),
  }));

  await createBulkNotifications(notifications);

  // ✅ URGENT bookings: Email + SMS
  if (urgency === 'URGENT') {
    await Promise.all(
      drivers.map(async (driver) => {
        // Send email
        await sendEmailNotification(
          driver.email,
          driver.name,
          title,
          message,
          NOTIFICATION_TYPES.BOOKING_AVAILABLE,
          booking.id
        );
        
        // Send SMS (will be demo mode unless SMS_ENABLED=true)
        if (driver.phone) {
          const smsMessage = `NEAT: Urgent trip! ${booking.pickupLocation} → ${booking.dropoffLocation} on ${new Date(booking.pickupTime).toLocaleDateString('en-GB')}. Check dashboard to bid.`;
          
          await sendSMS({
            to: driver.phone,
            message: smsMessage,
            userId: driver.id
          });
        }
      })
    );
    
    console.log(`✅ URGENT booking ${booking.id}: Email + SMS sent to ${drivers.length} drivers`);
  } else {
    console.log(`📋 Standard booking ${booking.id}: Queued for digest (${drivers.length} drivers)`);
  }
}


/**
 * Notify driver of booking assignment
 */
export async function notifyDriverOfAssignment(booking, driverId) {
  const title = 'Booking Assigned to You';
  const message = `You have been assigned a booking: ${booking.pickupLocation} to ${booking.dropoffLocation} on ${new Date(booking.pickupTime).toLocaleString()}`;

  await createNotification({
    userId: driverId,
    type: NOTIFICATION_TYPES.BOOKING_ASSIGNED,
    title,
    message,
    bookingId: booking.id,
  });
}

/**
 * Notify manager of new booking in their area
 */
export async function notifyManagerOfNewBooking(booking) {
  const managers = await prisma.user.findMany({
    where: {
      role: 'MANAGER',
      areaId: booking.areaId,
      isApproved: true,
    },
    select: { id: true },
  });

  const title = 'New Booking Created';
  const message = `A new booking has been created in your area: ${booking.pickupLocation} to ${booking.dropoffLocation}`;

  const notifications = managers.map((manager) => ({
    userId: manager.id,
    type: NOTIFICATION_TYPES.BOOKING_CREATED,
    bookingId: booking.id,
    payload: JSON.stringify({ title, message }),
  }));

  await createBulkNotifications(notifications);
}

/**
 * Notify manager of new bid
 */
export async function notifyManagerOfBid(booking, bid) {
  const title = 'New Bid Received';
  const message = `A driver has placed a bid of £${(bid.amountCents / 100).toFixed(2)} on booking #${booking.id}`;

  await createNotification({
    userId: booking.managerId,
    type: NOTIFICATION_TYPES.BID_RECEIVED,
    title,
    message,
    bookingId: booking.id,
    bidId: bid.id,
  });
}

/**
 * Notify driver their bid was accepted
 */
export async function notifyDriverBidAccepted(bid, bookingId) {
  const title = 'Your Bid Was Accepted!';
  const message = `Congratulations! Your bid of £${(bid.amountCents / 100).toFixed(2)} has been accepted.`;

  await createNotification({
    userId: bid.userId,
    type: NOTIFICATION_TYPES.BID_ACCEPTED,
    title,
    message,
    bidId: bid.id,
    bookingId: bookingId,
  });
}

/**
 * Notify driver their bid was rejected
 */
export async function notifyDriverBidRejected(bid, bookingId) {
  const title = 'Bid Not Accepted';
  const message = `Your bid of £${(bid.amountCents / 100).toFixed(2)} was not accepted. Keep an eye out for more opportunities!`;

  await createNotification({
    userId: bid.userId,
    type: NOTIFICATION_TYPES.BID_REJECTED,
    title,
    message,
    bidId: bid.id,
    bookingId: bookingId,
  });
}

/**
 * Notify of booking cancellation
 */
export async function notifyBookingCancellation(booking) {
  const usersToNotify = [];

  if (booking.driverId) {
    usersToNotify.push(booking.driverId);
  }
  if (booking.managerId) {
    usersToNotify.push(booking.managerId);
  }

  const title = 'Booking Cancelled';
  const message = `The booking for ${booking.pickupLocation} to ${booking.dropoffLocation} has been cancelled.`;

  const notifications = usersToNotify.map((userId) => ({
    userId,
    type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
    bookingId: booking.id,
    payload: JSON.stringify({ title, message }),
  }));

  await createBulkNotifications(notifications);
}
