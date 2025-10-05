"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function completeOnboarding(role) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Unauthenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { success: false, error: "User not found" };

  try {
    if (role === "DRIVER") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { driverOnboarded: true },
      });
    }

    if (role === "ADMIN") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { adminOnboarded: true }, 
      });
    }
    if (role === "COORDINATOR") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { coordinatorOnboarded: true }, 
      });
    }
    if (role === "MANAGER") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { managerOnboarded: true }, 
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to complete onboarding:", err);
    return { success: false, error: err.message };
  }
}