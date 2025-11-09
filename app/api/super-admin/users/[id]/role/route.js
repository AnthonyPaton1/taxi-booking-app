import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { newRole } = await request.json();

    // Validate new role
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'MANAGER', 'DRIVER', 'PUBLIC'];
    if (!newRole || !validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent changing your own role
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent demoting other super admins
    if (user.role === 'SUPER_ADMIN' && newRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Cannot demote other Super Admins' 
      }, { status: 403 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        role: newRole,
        // Reset onboarding flags when changing roles
        driverOnboarded: newRole === 'DRIVER' ? false : user.driverOnboarded,
        managerOnboarded: newRole === 'MANAGER' ? false : user.managerOnboarded,
        coordinatorOnboarded: newRole === 'COORDINATOR' ? false : user.coordinatorOnboarded,
        adminOnboarded: newRole === 'ADMIN' ? false : user.adminOnboarded
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    );
  }
}