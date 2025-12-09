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
    const role = searchParams.get('role'); // Filter by role
    const search = searchParams.get('search'); // Search by name or email

    // Build where clause
    const where = {
      deletedAt: null
    };

    if (role && ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'MANAGER', 'DRIVER', 'PUBLIC'].includes(role)) {
      where.role = role;
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isApproved: true,
        emailVerified: true,
        createdAt: true,
        businessId: true,
        areaId: true,
        driver: {
          select: {
            id: true,
            approved: true
          }
        },
        business: {
          select: {
            name: true
          }
        },
        area: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Filter by search term if provided
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Get counts for stats
    const stats = {
      total: users.length,
      superAdmin: users.filter(u => u.role === 'SUPER_ADMIN').length,
      admin: users.filter(u => u.role === 'ADMIN').length,
      coordinator: users.filter(u => u.role === 'COORDINATOR').length,
      manager: users.filter(u => u.role === 'MANAGER').length,
      driver: users.filter(u => u.role === 'DRIVER').length,
      public: users.filter(u => u.role === 'PUBLIC').length
    };

    return NextResponse.json({ 
      users: filteredUsers,
      stats
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}