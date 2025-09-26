"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { safeParse } from "@/lib/utils/safeParse";
import { RideRequestSchema } from "@/lib/validators";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function createRideRequest(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = safeParse(RideRequestSchema, formData);

  return prisma.rideRequest.create({
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
    },
  });
}

export async function acceptBid(rideRequestId, bidId) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // author must own the ride
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rideRequest.findUnique({
      where: { id: rideRequestId },
      select: { id: true, createdById: true, acceptedBidId: true },
    });
    if (!ride) throw new Error("Ride not found");
    if (ride.createdById !== session.user.id) throw new Error("Forbidden");
    if (ride.acceptedBidId) throw new Error("Already accepted");

    // ensure bid belongs to ride
    const bid = await tx.bid.findUnique({
      where: { id: bidId },
      select: { id: true, rideRequestId: true },
    });
    if (!bid || bid.rideRequestId !== ride.id) throw new Error("Bad bid");

    // mark accepted
    const updatedRide = await tx.rideRequest.update({
      where: { id: ride.id },
      data: { acceptedBidId: bid.id },
    });

    // optionally mark others as declined
    await tx.bid.updateMany({
      where: { rideRequestId: ride.id, NOT: { id: bid.id } },
      data: { status: "DECLINED" },
    });

    await tx.bid.update({
      where: { id: bid.id },
      data: { status: "ACCEPTED" },
    });

    return updatedRide;
  });
}
