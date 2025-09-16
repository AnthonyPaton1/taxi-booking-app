"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getInstantBookings() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.instantBooking.findMany({
    where: { createdById: session.user.id },
    orderBy: { pickupTime: "asc" },
  });
}

export async function getAdvancedBookings() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.advancedBooking.findMany({
    where: { createdById: session.user.id },
    orderBy: { pickupTime: "asc" },
  });
}