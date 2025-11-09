// app/api/admin/areas/add/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';

export async function POST(request) {
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

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Area name is required'
      }, { status: 400 });
    }

    // Create area (allow duplicates - different businesses can use same area names)
    const area = await prisma.area.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Area created successfully',
      area,
    });

  } catch (error) {
    console.error('Error creating area:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create area: ' + error.message
    }, { status: 500 });
  }
}