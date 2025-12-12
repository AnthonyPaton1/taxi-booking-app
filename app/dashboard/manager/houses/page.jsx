// app/dashboard/manager/houses/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
        where: { deletedAt: null },
        include: {
          area: true,
          residents: {
            orderBy: { name: "asc" },
          },
        },
        orderBy: { label: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // ✅ IMPROVED: Get all booking counts in TWO queries instead of N queries
  const houseIds = user.houses.map(h => h.id);
  
  // Get upcoming booking counts for all houses at once
  const upcomingCounts = await prisma.booking.groupBy({
    by: ['houseId'],
    where: {
      houseId: { in: houseIds },
      pickupTime: { gte: new Date() },
      status: { in: ["PENDING", "BID_ACCEPTED", "ACCEPTED"] },
      deletedAt: null,
    },
    _count: { id: true },
  });
  
  // Get total booking counts for all houses at once
  const totalCounts = await prisma.booking.groupBy({
    by: ['houseId'],
    where: {
      houseId: { in: houseIds },
      deletedAt: null,
    },
    _count: { id: true },
  });
  
  // Create lookup maps
  const upcomingMap = Object.fromEntries(
    upcomingCounts.map(c => [c.houseId, c._count.id])
  );
  const totalMap = Object.fromEntries(
    totalCounts.map(c => [c.houseId, c._count.id])
  );
  
  // ✅ IMPROVED: Map stats to houses (no more queries in loop!)
  const housesWithStats = user.houses.map(house => ({
    ...house,
    stats: {
      upcomingBookings: upcomingMap[house.id] || 0,
      totalBookings: totalMap[house.id] || 0,
    },
  }));

  return <HousesManagementClient houses={housesWithStats} userName={user.name} />;
}