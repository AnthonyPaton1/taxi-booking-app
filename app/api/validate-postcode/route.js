import { NextResponse } from "next/server";
import { getPostcodeCoordinates } from "@/lib/utils/postcodeUtils";

/**
 * GET /api/validate-postcode?postcode=SK4 1AA
 * Validates a UK postcode and returns coordinates if valid
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postcode = searchParams.get('postcode');

    if (!postcode) {
      return NextResponse.json(
        { valid: false, error: "Postcode is required" },
        { status: 400 }
      );
    }

    // This will throw an error if postcode is invalid
    const coordinates = await getPostcodeCoordinates(postcode);

    return NextResponse.json({
      valid: true,
      coordinates,
      message: "Postcode verified successfully",
    });
  } catch (error) {
    console.error("Postcode validation error:", error);

    // Return user-friendly error messages
    return NextResponse.json(
      {
        valid: false,
        error: error.message || "Invalid postcode",
      },
      { status: 400 }
    );
  }
}

/**
 * POST /api/validate-postcode
 * Validates a UK postcode and returns coordinates if valid
 */
export async function POST(req) {
  try {
    const { postcode } = await req.json();

    if (!postcode) {
      return NextResponse.json(
        { valid: false, error: "Postcode is required" },
        { status: 400 }
      );
    }

    // This will throw an error if postcode is invalid
    const coordinates = await getPostcodeCoordinates(postcode);

    return NextResponse.json({
      valid: true,
      coordinates,
      message: "Postcode verified successfully",
    });
  } catch (error) {
    console.error("Postcode validation error:", error);

    // Return user-friendly error messages
    return NextResponse.json(
      {
        valid: false,
        error: error.message || "Invalid postcode",
      },
      { status: 400 }
    );
  }
}