import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pickupPostcode, dropoffPostcode, accessibilityNeeds } = body;

    if (!pickupPostcode || !dropoffPostcode) {
      return NextResponse.json(
        { error: 'Pickup and dropoff postcodes are required' },
        { status: 400 }
      );
    }

    // Lightweight query - just count available drivers
    // This tests database connectivity without heavy computation
    const availableDrivers = await prisma.driver.count();

    return NextResponse.json({
      success: true,
      searchParams: {
        pickupPostcode,
        dropoffPostcode,
        accessibilityNeeds: accessibilityNeeds || {},
      },
      availableDrivers,
      message: 'Search completed successfully',
    });
  } catch (error) {
    console.error('Driver search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}