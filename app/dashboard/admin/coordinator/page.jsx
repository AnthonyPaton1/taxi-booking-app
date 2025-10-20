// app/dashboard/admin/coordinators/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminCoordinatorsClient from "@/components/dashboard/admin/adminCoordinatorsClient";

export default async function AdminCoordinatorsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get all coordinators with their areas and stats
  const coordinators = await prisma.coordinator.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          coordinatorOnboarded: true,
          lastLogin: true,
          createdAt: true,
        },
      },
      area: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  // Get manager counts per coordinator
  const coordinatorsWithStats = await Promise.all(
    coordinators.map(async (coordinator) => {
      const managerCount = await prisma.user.count({
        where: {
          role: "MANAGER",
          areaId: coordinator.areaId,
        },
      });

      const houseCount = await prisma.house.count({
        where: {
          areaId: coordinator.areaId,
        },
      });

      return {
        ...coordinator,
        stats: {
          managers: managerCount,
          houses: houseCount,
        },
      };
    })
  );

  // Get all areas for adding new coordinators
  const areas = await prisma.area.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <AdminCoordinatorsClient
      coordinators={coordinatorsWithStats}
      areas={areas}
    />
  );
}