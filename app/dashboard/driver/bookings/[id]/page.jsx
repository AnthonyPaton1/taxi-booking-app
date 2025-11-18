import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DriverBookingDetailsClient from "@/components/dashboard/driver/DriverBookingDetailsClient";

export default async function DriverBookingDetailsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { driver: true },
  });

  if (!user?.driver) {
    redirect("/dashboard/driver");
  }

  const booking = await prisma.advancedBooking.findUnique({
    where: { id },
    include: {
      accessibilityProfile: true,
      business: { select: { name: true, phone: true, email: true } },
      createdBy: { select: { name: true, email: true, phone: true } },
      bids: {
        where: { driverId: user.driver.id },
        orderBy: { createdAt: "desc" },
      },
      acceptedBid: {
        include: {
          driver: { select: { id: true, name: true, phone: true, vehicleReg: true } },
        },
      },
      _count: { select: { bids: true } },
    },
  });

  if (!booking) notFound();

  const myBid = booking.bids[0] || null;
  const didWinBid = booking.acceptedBid?.driver?.id === user.driver.id;

  return (
    <DriverBookingDetailsClient
      booking={booking}
      myBid={myBid}
      didWinBid={didWinBid}
      driverId={user.driver.id}
    />
  );
}