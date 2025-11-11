import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get('postcode');

    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    // Call the Postcodes.io API directly
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}/validate`
    );
    
    const data = await response.json();

    return NextResponse.json({
      valid: data.result,
      postcode: postcode,
    });
  } catch (error) {
    console.error('Postcode validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed', valid: false },
      { status: 500 }
    );
  }
}