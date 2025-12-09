//api/super-admin/drivers/[id]/delete
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { invalidateDriverCache } from '@/lib/matching/cached-matching-algorithm';


export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { id } = params;

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if driver has active bookings
    const activeBookings = await prisma.instantBooking.count({
      where: {
        driverId: id,
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete driver with active bookings',
        activeBookings 
      }, { status: 400 });
    }

    // Soft delete the driver and associated user
    await prisma.$transaction([
      prisma.driver.update({
        where: { id },
        data: { deletedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: driver.userId },
        data: { deletedAt: new Date() }
      })
    ]);
    await invalidateDriverCache(id);

    return NextResponse.json({ 
      message: 'Driver deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { error: 'Failed to delete driver', details: error.message },
      { status: 500 }
    );
  }
}