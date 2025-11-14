// lib/notifications.js


import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email'; 

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

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  advancedBookingId = null,
  instantBookingId = null,
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
        advancedBookingId,
        instantBookingId,
        bidId,
        payload: payload ? JSON.stringify({ title, message, ...payload }) : JSON.stringify({ title, message }),
      },
    });

    // Optionally send email
    if (shouldSendEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        await sendEmailNotification(user.email, user.name, title, message);
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
      advancedBooking: {
        select: {
          id: true,
          pickupLocation: true,
          dropoffLocation: true,
          pickupTime: true,
        },
      },
      instantBooking: {
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
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { 
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        advancedBooking: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            pickupTime: true,
          },
        },
        instantBooking: {
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
    }),
    prisma.notification.count({ 
      where: { 
        userId,
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
    total,
    hasMore: skip + take < total,
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, userId) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Security: ensure user owns notification
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
 * Send email notification (wrapper)
 */
async function sendEmailNotification(email, name, title, message) {
  try {
    await sendEmail({
      to: email,
      subject: `NEAT Transport: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">NEAT Transport</h2>
          <h3>${title}</h3>
          <p>Hi ${name},</p>
          <p>${message}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            You can view more details by logging into your dashboard at 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">NEAT Transport</a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw - notification still created in DB
  }
}

// ============================================
// SPECIFIC NOTIFICATION CREATORS
// ============================================

/**
 * Notify drivers of new instant booking
 */
export async function notifyDriversOfInstantBooking(instantBooking) {
  const drivers = await prisma.user.findMany({
    where: {
      role: 'DRIVER',
      isApproved: true,
      areaId: instantBooking.areaId,
      // Add additional filters based on capabilities if needed
    },
    select: { id: true, name: true, email: true },
  });

  const title = 'New Instant Booking Available';
  const message = `A new instant booking is available: ${instantBooking.pickupLocation} to ${instantBooking.dropoffLocation} at ${new Date(instantBooking.pickupTime).toLocaleString()}`;

  const notifications = drivers.map((driver) => ({
    userId: driver.id,
    type: NOTIFICATION_TYPES.BOOKING_AVAILABLE,
    instantBookingId: instantBooking.id,
    payload: JSON.stringify({ title, message }),
  }));

  await createBulkNotifications(notifications);

  // Send emails in parallel
  await Promise.all(
    drivers.map((driver) =>
      sendEmailNotification(
        driver.email,
        driver.name,
        title,
        'A new instant booking is available. Log in to your dashboard to view and accept it.'
      )
    )
  );
}

/**
 * Notify driver of booking assignment (for advanced bookings)
 */
export async function notifyDriverOfAssignment(booking, driverId, bookingType = 'advanced') {
  const title = 'Booking Assigned to You';
  const message = `You have been assigned a booking: ${booking.pickupLocation} to ${booking.dropoffLocation} on ${new Date(booking.pickupTime).toLocaleString()}`;

  await createNotification({
    userId: driverId,
    type: NOTIFICATION_TYPES.BOOKING_ASSIGNED,
    title,
    message,
    advancedBookingId: bookingType === 'advanced' ? booking.id : null,
    instantBookingId: bookingType === 'instant' ? booking.id : null,
  });
}

/**
 * Notify manager of new booking in their area
 */
export async function notifyManagerOfNewBooking(booking, bookingType = 'advanced') {
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
    advancedBookingId: bookingType === 'advanced' ? booking.id : null,
    instantBookingId: bookingType === 'instant' ? booking.id : null,
    payload: JSON.stringify({ title, message }),
  }));

  await createBulkNotifications(notifications);
}

/**
 * Notify coordinator of new bid
 */
export async function notifyCoordinatorOfBid(booking, bid, bookingType = 'advanced') {
  const title = 'New Bid Received';
  const message = `A driver has placed a bid of £${bid.amountCents} on your booking`;

  await createNotification({
    userId: booking.coordinatorId,
    type: NOTIFICATION_TYPES.BID_RECEIVED,
    title,
    message,
    advancedBookingId: bookingType === 'advanced' ? booking.id : null,
    instantBookingId: bookingType === 'instant' ? booking.id : null,
    bidId: bid.id,
  });
}

/**
 * Notify driver their bid was accepted
 */
export async function notifyDriverBidAccepted(bid, bookingId, bookingType = 'advanced') {
  const title = 'Your Bid Was Accepted!';
  const message = `Congratulations! Your bid of £${bid.amountCents} has been accepted.`;

  await createNotification({
    userId: bid.driverId,
    type: NOTIFICATION_TYPES.BID_ACCEPTED,
    title,
    message,
    bidId: bid.id,
    advancedBookingId: bookingType === 'advanced' ? bookingId : null,
    instantBookingId: bookingType === 'instant' ? bookingId : null,
  });
}

/**
 * Notify driver their bid was rejected
 */
export async function notifyDriverBidRejected(bid, bookingId, bookingType = 'advanced') {
  const title = 'Bid Not Accepted';
  const message = `Your bid of £${bid.amountCents} was not accepted. Keep an eye out for more opportunities!`;

  await createNotification({
    userId: bid.driverId,
    type: NOTIFICATION_TYPES.BID_REJECTED,
    title,
    message,
    bidId: bid.id,
    advancedBookingId: bookingType === 'advanced' ? bookingId : null,
    instantBookingId: bookingType === 'instant' ? bookingId : null,
  });
}

/**
 * Notify of booking cancellation
 */
export async function notifyBookingCancellation(booking, bookingType = 'advanced') {
  const usersToNotify = [];

  if (booking.driverId) {
    usersToNotify.push(booking.driverId);
  }
  if (booking.coordinatorId) {
    usersToNotify.push(booking.coordinatorId);
  }

  const title = 'Booking Cancelled';
  const message = `The booking for ${booking.pickupLocation} to ${booking.dropoffLocation} has been cancelled.`;

  const notifications = usersToNotify.map((userId) => ({
    userId,
    type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
    advancedBookingId: bookingType === 'advanced' ? booking.id : null,
    instantBookingId: bookingType === 'instant' ? booking.id : null,
    payload: JSON.stringify({ title, message }),
  }));

  await createBulkNotifications(notifications);
}

/**
 * Notify driver of payment received
 */
export async function notifyPaymentReceived(driverId, amountCents, bookingId, bookingType = 'advanced') {
  const title = 'Payment Received';
  const message = `You have received a payment of £${amountCents} for your completed booking.`;

  await createNotification({
    userId: driverId,
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title,
    message,
    advancedBookingId: bookingType === 'advanced' ? bookingId : null,
    instantBookingId: bookingType === 'instant' ? bookingId : null,
  });
}