import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { BidSchema } from "@/lib/validators";
import { safeParse } from "@/lib/utils/safeParse";
import { normalizeBid } from "@/lib/constants";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await req.json();
    const normalized = normalizeBid(raw);
    const data = safeParse(BidSchema, normalized);

    // Optional: ensure only drivers can bid
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!me)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (me.role !== "DRIVER") {
      return NextResponse.json({ error: "Drivers only" }, { status: 403 });
    }

    // Ensure ride exists and still open
    const ride = await prisma.rideRequest.findUnique({
      where: { id: data.rideRequestId },
      select: { id: true, acceptedBidId: true },
    });
    if (!ride)
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    if (ride.acceptedBidId) {
      return NextResponse.json(
        { error: "Ride already has an accepted bid" },
        { status: 409 }
      );
    }

    // Optional: prevent duplicate pending bids by same driver on same ride
    const existing = await prisma.bid.findFirst({
      where: {
        rideRequestId: data.rideRequestId,
        userId: session.user.id,
        status: "PENDING",
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending bid on this ride" },
        { status: 409 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        rideRequestId: data.rideRequestId,
        userId: session.user.id,
        amountCents: data.amountCents,
        message: data.message ?? null,
        status: "PENDING",
      },
      select: {
        id: true,
        rideRequestId: true,
        userId: true,
        amountCents: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (err) {
    if (err?.message === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid input", details: err.details },
        { status: 400 }
      );
    }
    console.error("POST /api/bids error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rideRequestId = searchParams.get("rideRequestId");
  if (!rideRequestId)
    return NextResponse.json(
      { error: "rideRequestId required" },
      { status: 400 }
    );

  const items = await prisma.bid.findMany({
    where: { rideRequestId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      amountCents: true,
      message: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}
