// app/api/super-admin/stats/route.js (or wherever this file is)

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

    // ✅ Fetch all stats in parallel - UNIFIED BOOKINGS
    const [
      totalUsers,
      totalDrivers,
      pendingDrivers,
      approvedDrivers,
      totalBusinesses,
      totalBookings,
      urgentBookings,
      standardBookings,
      completedBookings,
      totalHouses,
      totalIncidents,
      totalBids,
      activeBids,
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
      
      // ✅ Total bookings (unified)
      prisma.booking.count(),
      
      // ✅ Urgent bookings (< 48 hours)
      prisma.booking.count({
        where: {
          pickupTime: {
            lte: new Date(Date.now() + 48 * 60 * 60 * 1000) // Next 48 hours
          }
        }
      }),
      
      // ✅ Standard bookings (> 48 hours)
      prisma.booking.count({
        where: {
          pickupTime: {
            gt: new Date(Date.now() + 48 * 60 * 60 * 1000)
          }
        }
      }),
      
      // ✅ Completed bookings
      prisma.booking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Houses
      prisma.house.count({
        where: { deletedAt: null }
      }),
      
      // Incidents
      prisma.incident.count(),
      
      // ✅ Total bids
      prisma.bid.count(),
      
      // ✅ Active bids (pending status)
      prisma.bid.count({
        where: { status: 'PENDING' }
      }),
      
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
      
      // ✅ Recent bookings (unified)
      prisma.booking.findMany({
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
          createdAt: true,
          _count: {
            select: { bids: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

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
        totalIncidents,
        totalBids,
        activeBids
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
          urgent: urgentBookings, // ✅ < 48 hours
          standard: standardBookings, // ✅ > 48 hours
          completed: completedBookings,
          completionRate: totalBookings > 0 
            ? (completedBookings / totalBookings * 100).toFixed(1)
            : 0,
          averageBidsPerBooking: totalBookings > 0
            ? (totalBids / totalBookings).toFixed(1)
            : 0
        },
        bids: {
          total: totalBids,
          active: activeBids,
          acceptanceRate: totalBids > 0
            ? ((totalBids - activeBids) / totalBids * 100).toFixed(1)
            : 0
        }
      },
      recent: {
        users: recentUsers,
        bookings: recentBookings.map(booking => ({
          ...booking,
          bidCount: booking._count.bids,
          isUrgent: new Date(booking.pickupTime) <= new Date(Date.now() + 48 * 60 * 60 * 1000)
        }))
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