import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { RideRequestSchema } from "@/lib/validators";
import { safeParse } from "@/lib/utils/safeParse";
import { normalizeRideRequest } from "@/lib/constants";
import { geocodeAddress } from "@/lib/utils/geocode";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await req.json();
    const normalized = normalizeRideRequest(raw);
    const data = safeParse(RideRequestSchema, normalized);

    // ✅ Geocode pickup location
    const pickupCoords = await geocodeAddress(data.pickupLocation);
    const dropoffCoords = await geocodeAddress(data.dropoffLocation);

    const ride = await prisma.rideRequest.create({
      data: {
        createdById: session.user.id,
        pickupTime: data.pickupTime,
        returnTime: data.returnTime ?? null,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        wheelchairAccess: data.wheelchairAccess,
        highRoof: data.highRoof,
        carerPresent: data.carerPresent,
        notes: data.notes ?? null,

        // ✅ Include geolocation
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,

        distanceKm: data.distanceKm ?? null,
        passengersName: data.passengersName ?? null,
        additionalNeeds: data.additionalNeeds ?? null,
      },
      select: {
        id: true,
        pickupTime: true,
        returnTime: true,
        pickupLocation: true,
        dropoffLocation: true,
        wheelchairAccess: true,
        highRoof: true,
        carerPresent: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (err) {
    if (err?.message === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid input", details: err.details },
        { status: 400 }
      );
    }
    console.error("POST /api/rides error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// (nice to have) GET /api/rides — list my rides
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rides = await prisma.rideRequest.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        pickupTime: true,
        pickupLocation: true,
        dropoffLocation: true,
        acceptedBidId: true,
        createdAt: true,
      },
      take: 50,
    });

    return NextResponse.json({ items: rides });
  } catch (err) {
    console.error("GET /api/rides error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
