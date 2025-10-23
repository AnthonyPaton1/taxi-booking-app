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
      users: {
        where: {
          role: 'COORDINATOR'
        },
        select: {
          id: true,
          name: true,
          email: true,
          coordinatorOnboarded: true
        }
      },
      house: {
        include: {
          residents: true // Need to include residents to count them
        }
      },
      _count: {
        select: {
          house: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  const areasWithStats = areas.map((area) => ({
    ...area,
    totalResidents: area.house.reduce(
      (sum, house) => sum + (house.residents?.length || 0),
      0
    ),
    managers: area.house
      .map((h) => h.managerId)
      .filter((v, i, a) => v && a.indexOf(v) === i).length,
  }));

  return <AdminAreasClient areas={areasWithStats} />;
}