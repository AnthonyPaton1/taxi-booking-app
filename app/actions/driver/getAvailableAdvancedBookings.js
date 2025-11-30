//app/actions/bookings/driver/getAvailableAdvancedBookings
import { getSessionUser } from "@/lib/getSessionUser";
import { prisma } from "@/lib/db";

export async function getAvailableAdvancedBookings() {
  const user = await getSessionUser();
  console.log("👤 User:", user?.id);
  if (!user) return [];

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
    include: {
      accessibilityProfile: true
    }
  });

  console.log("🚗 Driver:", driver?.id, "Class:", driver?.vehicleClass, "Approved:", driver?.approved);
  if (!driver) return [];

  const bookings = await prisma.advancedBooking.findMany({
    where: {
      status: "OPEN",
      NOT: {
        bids: {
          some: { driverId: driver.id },
        },
      },
    },
    include: {
      accessibilityProfile: true  
    },
    orderBy: { pickupTime: "asc" },
  });

  console.log("📋 Found bookings:", bookings.length);
  bookings.forEach(b => {
    console.log(`  - Booking ${b.id}: ${b.pickupLocation} → ${b.dropoffLocation}`);
    console.log(`    Vehicle needed: ${b.accessibilityProfile?.vehicleClassRequired}`);
  });

  return bookings;
}