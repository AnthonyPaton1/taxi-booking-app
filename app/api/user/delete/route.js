import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user with all relations to check what needs deleting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driver: {
          include: {
            compliance: true,
            accessibilityProfile: true,
          }
        },
        business: true,
        instantBookings: true,
        advancedBookings: true,
        bids: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has active bookings
    const activeInstantBookings = await prisma.instantBooking.count({
      where: {
        createdById: userId,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
      }
    });

    const activeAdvancedBookings = await prisma.advancedBooking.count({
      where: {
        createdById: userId,
        status: { in: ['OPEN', 'ACCEPTED', 'IN_PROGRESS'] }
      }
    });

    if (activeInstantBookings > 0 || activeAdvancedBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete account with active bookings. Please complete or cancel all bookings first.',
        activeBookings: activeInstantBookings + activeAdvancedBookings
      }, { status: 400 });
    }

    // If driver, check for active rides
    if (user.driver) {
      const activeDriverBookings = await prisma.instantBooking.count({
        where: {
          driverId: user.driver.id,
          status: { in: ['ACCEPTED', 'IN_PROGRESS'] }
        }
      });

      if (activeDriverBookings > 0) {
        return NextResponse.json({ 
          error: 'Cannot delete driver account with active rides. Please complete all rides first.',
          activeRides: activeDriverBookings
        }, { status: 400 });
      }
    }

    // Perform cascading soft delete in transaction
    await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Soft delete driver-related data
      if (user.driver) {
        // Delete compliance records
        if (user.driver.compliance) {
          await tx.driverCompliance.update({
            where: { driverId: user.driver.id },
            data: { deletedAt: now }
          });
        }

        // Delete accessibility profile
        if (user.driver.accessibilityProfileId) {
          await tx.accessibilityProfile.update({
            where: { id: user.driver.accessibilityProfileId },
            data: { deletedAt: now }
          });
        }

        // Soft delete driver
        await tx.driver.update({
          where: { id: user.driver.id },
          data: { deletedAt: now }
        });
      }

      // Soft delete business if owner
      if (user.business) {
        await tx.business.update({
          where: { id: user.business.id },
          data: { deletedAt: now }
        });
      }

      // Anonymize completed bookings (keep for records but remove PII)
      await tx.instantBooking.updateMany({
        where: { createdById: userId },
        data: {
          pickupLocation: '[DELETED USER]',
          dropoffLocation: '[DELETED USER]',
          deletedAt: now
        }
      });

      await tx.advancedBooking.updateMany({
        where: { createdById: userId },
        data: {
          pickupLocation: '[DELETED USER]',
          dropoffLocation: '[DELETED USER]',
          deletedAt: now
        }
      });

      // Delete bids
      await tx.bid.updateMany({
        where: { userId },
        data: { deletedAt: now }
      });

      // Anonymize user data (GDPR compliance)
      await tx.user.update({
        where: { id: userId },
        data: {
          name: '[DELETED USER]',
          email: `deleted-${userId}@deleted.local`,
          phone: null,
          image: null,
          deletedAt: now,
          // Keep role/dates for audit trail
        }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Your account and all associated data have been deleted successfully.'
    });

  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    );
  }
}