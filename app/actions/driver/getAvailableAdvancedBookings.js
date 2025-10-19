//app/actions/bookings/driver/getAvailableAdvancedBookings
import { getSessionUser } from "@/lib/getSessionUser";
import { prisma } from "@/lib/db";

export async function getAvailableAdvancedBookings() {
  const user = await getSessionUser();
  if (!user) return []; // Fail-safe return

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
  });

  if (!driver) return [];

  return prisma.advancedBooking.findMany({
    where: {
      status: "OPEN",
      NOT: {
        bids: {
          some: { driverId: driver.id },
        },
      },
    },
    orderBy: { pickupTime: "asc" },
  });
}