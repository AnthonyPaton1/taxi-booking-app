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

    // Fetch all stats in parallel for speed
    const [
      totalUsers,
      totalDrivers,
      pendingDrivers,
      approvedDrivers,
      totalBusinesses,
      totalAdvancedBookings,
      totalInstantBookings,
      completedAdvancedBookings,
      completedInstantBookings,
      totalHouses,
      totalIncidents,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      // Users
      prisma.user.count({
        where: { deletedAt: null }
      }),
      
      // Drivers
      prisma.driver.count({
        where: {
          user: { deletedAt: null }
        }
      }),
      
      // Pending drivers
      prisma.driver.count({
        where: {
          approved: false,
          user: { deletedAt: null }
        }
      }),
      
      // Approved drivers
      prisma.driver.count({
        where: {
          approved: true,
          user: { deletedAt: null }
        }
      }),
      
      // Businesses
      prisma.business.count(),
      
      // Advanced bookings
      prisma.advancedBooking.count(),
      
      // Instant bookings
      prisma.instantBooking.count(),
      
      // Completed advanced bookings
      prisma.advancedBooking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Completed instant bookings
      prisma.instantBooking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Houses
      prisma.house.count({
        where: { deletedAt: null }
      }),
      
      // Incidents
      prisma.incident.count(),
      
      // Recent users (last 7 days)
      prisma.user.findMany({
        where: {
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent bookings
      prisma.advancedBooking.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          pickupLocation: true,
          dropoffLocation: true,
          pickupTime: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const totalBookings = totalAdvancedBookings + totalInstantBookings;
    const completedBookings = completedAdvancedBookings + completedInstantBookings;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalDrivers,
        pendingDrivers,
        approvedDrivers,
        totalBusinesses,
        totalBookings,
        completedBookings,
        totalHouses,
        totalIncidents
      },
      breakdown: {
        drivers: {
          total: totalDrivers,
          pending: pendingDrivers,
          approved: approvedDrivers,
          rejectionRate: totalDrivers > 0 
            ? ((totalDrivers - approvedDrivers - pendingDrivers) / totalDrivers * 100).toFixed(1)
            : 0
        },
        bookings: {
          total: totalBookings,
          advanced: totalAdvancedBookings,
          instant: totalInstantBookings,
          completed: completedBookings,
          completionRate: totalBookings > 0 
            ? (completedBookings / totalBookings * 100).toFixed(1)
            : 0
        }
      },
      recent: {
        users: recentUsers,
        bookings: recentBookings
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}