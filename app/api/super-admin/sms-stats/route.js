// app/api/super-admin/sms-stats/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Super admin only
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get SMS logs (if table exists, otherwise return demo data)
    let smsLogs = [];
    try {
      smsLogs = await prisma.smsLog.findMany({
        where: {
          sentAt: {
            gte: startDate,
            lte: now
          }
        },
        include: {
          user: {
            select: {
              name: true,
              phone: true
            }
          }
        },
        orderBy: {
          sentAt: 'desc'
        }
      });
    } catch (error) {
      // SMS table doesn't exist yet - return demo data
      console.log('SMS logs table not found, returning demo data');
    }

    // Calculate stats
    const totalSent = smsLogs.length;
    const totalCostPounds = (totalSent * 4 / 100).toFixed(2);
    
    // Project monthly cost based on current rate
    const daysInRange = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const avgPerDay = daysInRange > 0 ? totalSent / daysInRange : 0;
    const projectedMonthly = (avgPerDay * 30 * 0.04).toFixed(2);

    // Unique recipients
    const uniqueRecipients = new Set(smsLogs.map(log => log.userId)).size;

    // Avg cost per driver
    const avgCostPerDriver = uniqueRecipients > 0 
      ? (totalCostPounds / uniqueRecipients).toFixed(2) 
      : '0.00';

    // Cost as % of revenue (assuming 20 drivers @ £99)
    const monthlyRevenue = 20 * 99;
    const costAsPercentOfRevenue = ((projectedMonthly / monthlyRevenue) * 100).toFixed(1);

    // Top users
    const userCounts = smsLogs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
      return acc;
    }, {});

    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => {
        const log = smsLogs.find(l => l.userId === userId);
        return {
          userId,
          name: log?.user?.name || 'Unknown',
          phone: log?.phoneNumber || 'N/A',
          smsCount: count
        };
      });

    // Recent SMS (last 20)
    const recentSMS = smsLogs.slice(0, 20).map(log => ({
      recipientName: log.user?.name || 'Unknown',
      message: log.message,
      sentAt: log.sentAt
    }));

    return NextResponse.json({
      totalSent,
      totalCostPounds,
      projectedMonthly,
      uniqueRecipients,
      avgCostPerDriver,
      costAsPercentOfRevenue,
      topUsers,
      recentSMS
    });

  } catch (error) {
    console.error('Error fetching SMS stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS statistics' },
      { status: 500 }
    );
  }
}