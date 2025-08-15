import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rideId } = params;
    const { bidId } = await req.json();
    if (!bidId)
      return NextResponse.json({ error: "bidId is required" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        select: { id: true, createdById: true, acceptedBidId: true },
      });
      if (!ride) throw new Error("RideNotFound");
      if (ride.createdById !== session.user.id) throw new Error("Forbidden");
      if (ride.acceptedBidId) throw new Error("AlreadyAccepted");

      const bid = await tx.bid.findUnique({
        where: { id: bidId },
        select: { id: true, rideRequestId: true },
      });
      if (!bid) throw new Error("BidNotFound");
      if (bid.rideRequestId !== ride.id) throw new Error("BidMismatch");

      // Accept this bid
      await tx.rideRequest.update({
        where: { id: ride.id },
        data: { acceptedBidId: bid.id },
      });

      // Mark chosen bid as ACCEPTED
      await tx.bid.update({
        where: { id: bid.id },
        data: { status: "ACCEPTED" },
      });

      // Decline all others
      await tx.bid.updateMany({
        where: { rideRequestId: ride.id, NOT: { id: bid.id } },
        data: { status: "DECLINED" },
      });

      // Return a summary
      return tx.rideRequest.findUnique({
        where: { id: ride.id },
        select: {
          id: true,
          acceptedBidId: true,
          pickupLocation: true,
          dropoffLocation: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err.message === "RideNotFound")
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    if (err.message === "BidNotFound")
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    if (err.message === "BidMismatch")
      return NextResponse.json(
        { error: "Bid does not belong to this ride" },
        { status: 400 }
      );
    if (err.message === "AlreadyAccepted")
      return NextResponse.json(
        { error: "Ride already has an accepted bid" },
        { status: 409 }
      );
    if (err.message === "Forbidden")
      return NextResponse.json(
        { error: "You do not own this ride" },
        { status: 403 }
      );
    console.error("POST /api/rides/[rideId]/accept error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
