import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

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

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            houses: true,
            users: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Soft delete the business
    await prisma.business.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ 
      message: 'Business deleted successfully',
      warning: business._count.houses > 0 || business._count.users > 0 
        ? `This business had ${business._count.houses} houses and ${business._count.users} users` 
        : null
    });

  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: 'Failed to delete business', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const { name, address, phone } = await request.json();

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        name: name || undefined,
        address: address || undefined,
        phone: phone || undefined
      }
    });

    return NextResponse.json({ 
      message: 'Business updated successfully',
      business: updatedBusiness
    });

  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business', details: error.message },
      { status: 500 }
    );
  }
}