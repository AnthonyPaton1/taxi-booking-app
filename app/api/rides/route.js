import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { RideRequestSchema } from "@/lib/validators";
import { safeParse } from "@/lib/utils/safeParse";
import { normalizeRideRequest } from "@/lib/constants";

export async function POST(req) {
  try {
    // 1) Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse body (works with JSON or FormData sent as JSON)
    const raw = await req.json();
    const normalized = normalizeRideRequest(raw);

    // 3) Validate
    const data = safeParse(RideRequestSchema, normalized);

    // 4) Create in DB
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
        // optional extras if you provided them:
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
    // Zod validation error bubbled by safeParse
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
