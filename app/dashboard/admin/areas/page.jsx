// app/dashboard/admin/areas/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminAreasClient from "@/components/dashboard/business/admin/adminAreasClient";

export default async function AdminAreasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get all areas with counts
  const areas = await prisma.area.findMany({
    include: {
      coordinators: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      houses: {
        include: {
          residents: true,
        },
      },
      _count: {
        select: {
          coordinators: true,
          houses: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const areasWithStats = areas.map((area) => ({
    ...area,
    totalResidents: area.houses.reduce(
      (sum, house) => sum + house.residents.length,
      0
    ),
    managers: area.houses.map((h) => h.managerId).filter((v, i, a) => a.indexOf(v) === i).length,
  }));

  return <AdminAreasClient areas={areasWithStats} />;
}