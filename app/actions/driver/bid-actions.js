"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { safeParse } from "@/lib/utils/safeParse";
import { BidSchema } from "@/lib/validators";

export async function createBid(input) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = safeParse(BidSchema, input);

  // ensure ride exists and is still open
  const ride = await prisma.rideRequest.findUnique({
    where: { id: data.rideRequestId },
    select: { id: true, acceptedBidId: true },
  });
  if (!ride) throw new Error("Ride not found");
  if (ride.acceptedBidId) throw new Error("Ride already has an accepted bid");

  const bid = await prisma.bid.create({
    data: {
      rideRequestId: data.rideRequestId,
      userId: session.user.id,
      amountCents: data.amountCents,
      message: data.message ?? null,
      status: "PENDING",
    },
  });

  return bid;
}

export async function getBidsForRide(rideRequestId) {
  return prisma.bid.findMany({
    where: { rideRequestId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteBid(bidId) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // only allow deleting own pending bid
  return prisma.bid.delete({
    where: { id: bidId },
  });
}
