// app/dashboard/driver/subscribe/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import SubscribeClient from "@/components/dashboard/driver/SubscribeClient";

export const metadata = {
  title: "Subscribe - NEAT Transport",
  description: "Subscribe to start bidding on bookings",
};

export default async function SubscribePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  // Get driver details
  const driver = await prisma.driver.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      isSubscribed: true,
      subscriptionTier: true,
      subscriptionStartDate: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!driver) {
    redirect("/dashboard/driver/onboarding");
  }

  // If already subscribed, redirect to dashboard
  if (driver.isSubscribed) {
    redirect("/dashboard/driver?message=already_subscribed");
  }

  // Get available bookings count (to show value)
  const bookingCount = await prisma.booking.count({
    where: {
      status: "PENDING",
      // Add your matching criteria here
    },
  });

  return (
    <SubscribeClient 
      driver={driver}
      availableBookings={bookingCount}
    />
  );
}