import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';

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

    if (driver.approved && driver.user.isApproved) {
      return NextResponse.json({ error: 'Driver is already approved' }, { status: 400 });
    }

    // Update driver status to approved
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        approved: true,
        user: {
          update: {
            isApproved: true
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

    // TODO: Send approval email to driver
    // await sendDriverApprovalEmail(updatedDriver.user.email, updatedDriver.user.name);

    return NextResponse.json({ 
      message: 'Driver approved successfully',
      driver: updatedDriver
    });

  } catch (error) {
    console.error('Error approving driver:', error);
    return NextResponse.json(
      { error: 'Failed to approve driver', details: error.message },
      { status: 500 }
    );
  }
}