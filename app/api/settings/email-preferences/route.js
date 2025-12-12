import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.userEmailPreferences.findUnique({
      where: { userId: session.user.id }
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userEmailPreferences.create({
        data: { userId: session.user.id }
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, userId, createdAt, updatedAt, ...updateData } = body;

    const preferences = await prisma.userEmailPreferences.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData
      }
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' }, 
      { status: 500 }
    );
  }
}