// app/api/admin/areas/[id]/delete/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const { id } = params;

    // Check if area exists
    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            house: true,
          },
        },
      },
    });

    if (!area) {
      return NextResponse.json({
        success: false,
        error: 'Area not found'
      }, { status: 404 });
    }

    // Check if area has users or houses
    if (area._count.users > 0 || area._count.house > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete area. It has ${area._count.users} users and ${area._count.house} houses. Please reassign them first.`
      }, { status: 400 });
    }

    // Delete area
    await prisma.area.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Area deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete area: ' + error.message
    }, { status: 500 });
  }
}

// Also support POST for compatibility with forms
export async function POST(request, { params }) {
  return DELETE(request, { params });
}