// app/dashboard/manager/houses/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import HousesManagementClient from "@/components/dashboard/business/manager/housesmanagementClient";

export default async function HousesManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      houses: {
        include: {
          area: true,
          residents: {
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          label: "asc",  // ✅ Changed from 'name' to 'label'
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get booking counts for each house
  const housesWithStats = await Promise.all(
    user.houses.map(async (house) => {
      const [upcomingBookings, totalBookings] = await Promise.all([
        // Count upcoming advanced bookings
        prisma.advancedBooking.count({
          where: {
            createdById: user.id,
            pickupTime: { gte: new Date() },
            status: { in: ["OPEN", "ACCEPTED"] },
          },
        }),
        // Count all bookings
        prisma.advancedBooking.count({
          where: {
            createdById: user.id,
          },
        }),
      ]);

      return {
        ...house,
        stats: {
          upcomingBookings,
          totalBookings,
        },
      };
    })
  );

  return <HousesManagementClient houses={housesWithStats} userName={user.name} />;
}