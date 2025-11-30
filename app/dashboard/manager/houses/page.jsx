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
                where: {
          deletedAt: null, 
        },

        include: {
          area: true,
          residents: {
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          label: "asc",  
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
  // ✅ Count upcoming bookings (unified)
  prisma.booking.count({
    where: {
      createdById: user.id,
      pickupTime: { gte: new Date() },
      status: {
        in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"]
      },
      deletedAt: null,
    }
  }),
  // ✅ Count total bookings (unified)
  prisma.booking.count({
    where: {
      createdById: user.id,
      deletedAt: null,
    }
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