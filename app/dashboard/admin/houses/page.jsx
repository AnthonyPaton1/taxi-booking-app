// app/dashboard/admin/houses/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminHousesClient from "@/components/dashboard/business/admin/adminHousesClient";

export default async function AdminHousesPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const areaFilter = searchParams?.area || "all";

  // Get all houses
  const houses = await prisma.house.findMany({
    where: areaFilter !== "all" ? { areaId: areaFilter } : {},
    include: {
      area: {
        select: {
          name: true,
        },
      },
      manager: {
        select: {
          name: true,
          email: true,
        },
      },
      residents: true,
    },
    orderBy: {
      label: "asc",
    },
  });

  // Get all areas for filter
  const areas = await prisma.area.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const totalResidents = houses.reduce((sum, h) => sum + h.residents.length, 0);

  return (
    <AdminHousesClient
      houses={houses}
      areas={areas}
      currentAreaFilter={areaFilter}
      totalResidents={totalResidents}
    />
  );
}