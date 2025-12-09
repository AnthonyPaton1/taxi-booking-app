//api/super-admin/drivers/[id]/reject
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { invalidateDriverCache } from '@/lib/matching/cached-matching-algorithm';

export async function POST(request, { params }) {
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
    const { reason } = await request.json();

    // Find the driver
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Update driver status to not approved
    // Note: Current schema doesn't track rejection separately
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        approved: false,
        user: {
          update: {
            isApproved: false
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    await invalidateDriverCache(updatedDriver.id);

   

    return NextResponse.json({ 
      message: 'Driver rejected',
      driver: updatedDriver
    });

  } catch (error) {
    console.error('Error rejecting driver:', error);
    return NextResponse.json(
      { error: 'Failed to reject driver', details: error.message },
      { status: 500 }
    );
  }
}