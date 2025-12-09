import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    const search = searchParams.get('search');

    // Fetch businesses (Business model doesn't have deletedAt)
    const businesses = await prisma.business.findMany({
      include: {
        _count: {
          select: {
            housesAsBusiness: true,
            advancedBookings: true,
            instantBookings: true
          }
        },
        employees: {
          where: {
            role: 'MANAGER',
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by search if provided
    let filteredBusinesses = businesses;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBusinesses = businesses.filter(biz =>
        biz.name?.toLowerCase().includes(searchLower) ||
        biz.address?.toLowerCase().includes(searchLower)
      );
    }

    const stats = {
      total: businesses.length,
      totalHouses: businesses.reduce((sum, b) => sum + b._count.housesAsBusiness, 0),
      totalBookings: businesses.reduce((sum, b) => sum + b._count.advancedBookings + b._count.instantBookings, 0)
    };

    return NextResponse.json({
      businesses: filteredBusinesses,
      stats
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', details: error.message },
      { status: 500 }
    );
  }
}