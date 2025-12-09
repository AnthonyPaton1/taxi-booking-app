// app/dashboard/admin/areas/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
      _count: {
        select: {
          house: true, // houses in this area
          users: true, // all users in this area
        }
      },
      users: {
        where: {
          deletedAt: null
        },
        select: {
          role: true
        }
      },
      house: {
        where: {
          deletedAt: null
        },
        include: {
          residents: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  // Transform data to include role-specific counts
  const areasWithStats = areas.map(area => {
    // Count coordinators (users with COORDINATOR role in this area)
    const coordinatorCount = area.users.filter(u => u.role === 'COORDINATOR').length;
    
    // Count managers (users with MANAGER role in this area)
    const managerCount = area.users.filter(u => u.role === 'MANAGER').length;
    
    // Count total residents across all houses
    const totalResidents = area.house.reduce((sum, h) => sum + h.residents.length, 0);

    return {
      id: area.id,
      name: area.name,
      _count: {
        coordinators: coordinatorCount,
        houses: area._count.house,
      },
      managers: managerCount,
      totalResidents: totalResidents
    };
  });

  return <AdminAreasClient areas={areasWithStats} />;
}