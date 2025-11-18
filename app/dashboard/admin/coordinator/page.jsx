// app/dashboard/admin/coordinators/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminCoordinatorsClient from "@/components/dashboard/business/admin/adminCoordinatorsClient";

export default async function AdminCoordinatorsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: true,
    },
  });

  if (!user || !user.adminOnboarded || !user.business) {
    redirect("/dashboard/admin");
  }

  // Get all coordinators in this business
  const coordinators = await prisma.user.findMany({
  where: {
    role: "COORDINATOR",
    businessId: user.businessId,
  },
  include: {
    area: {
      select: {
        name: true,
        id: true,
        house: {
          select: {
            id: true,
            managerId: true,
          },
        },
      },
    },
  },
  orderBy: {
    name: "asc",
  },
});

  // Calculate stats for each coordinator
  const coordinatorsWithStats = coordinators.map((coordinator) => {
    const houses = coordinator.area?.house || [];
    const uniqueManagers = new Set(
      houses.map((h) => h.managerId).filter((id) => id !== null)
    );

    return {
      ...coordinator,
      user: coordinator, // The coordinator IS the user in this case
      stats: {
        managers: uniqueManagers.size,
        houses: houses.length,
      },
    };
  });

  // Get all areas for the business
  const areas = await prisma.area.findMany({
    include: {
      _count: {
        select: {
          users: true,
          house: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <AdminCoordinatorsClient
      coordinators={coordinatorsWithStats}
      areas={areas}
      businessId={user.businessId}
      
    />
  );
}