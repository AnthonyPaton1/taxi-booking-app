import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, APPROVED
    const search = searchParams.get('search'); // Search by name or email

    // Build where clause
    const where = {
      user: {
        deletedAt: null
      }
    };

    // Filter by approval status
    if (status === 'PENDING') {
      where.approved = false;
    } else if (status === 'APPROVED') {
      where.approved = true;
    }
    // If status is 'ALL' or not specified, don't filter

    // Fetch drivers
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            isApproved: true
          }
        },
        accessibilityProfile: true,
        compliance: true
      },
      orderBy: [
        { approved: 'asc' }, // Not approved first (pending)
        { createdAt: 'desc' }
      ]
    });

    // Filter by search term if provided
    let filteredDrivers = drivers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDrivers = drivers.filter(driver => 
        driver.user.name?.toLowerCase().includes(searchLower) ||
        driver.user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Get counts for stats
    const stats = {
      total: drivers.length,
      pending: drivers.filter(d => !d.approved).length,
      approved: drivers.filter(d => d.approved).length,
      rejected: 0 // Not tracked in current schema
    };

    return NextResponse.json({ 
      drivers: filteredDrivers,
      stats
    });

  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers', details: error.message },
      { status: 500 }
    );
  }
}