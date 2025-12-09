import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { invalidateDriverCache } from '@/lib/matching/cached-matching-algorithm';

export async function POST(request, { params }) {
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
    const { suspended, reason } = await request.json();

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        suspended,
        suspendedReason: suspended ? reason : null,
        suspendedDate: suspended ? new Date() : null,
        suspendedBy: suspended ? session.user.id : null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // Invalidate cache so driver doesn't appear in matches
    await invalidateDriverCache(id);

    return NextResponse.json({ 
      success: true, 
      driver,
      message: suspended ? 'Driver suspended' : 'Driver activated'
    });

  } catch (error) {
    console.error('Error suspending/activating driver:', error);
    return NextResponse.json(
      { error: 'Failed to update driver status', details: error.message },
      { status: 500 }
    );
  }
}