"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getMyBids() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return prisma.bid.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOpenRides() {
  // simple example: rides with no accepted bid
  return prisma.rideRequest.findMany({
    where: { acceptedBidId: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
