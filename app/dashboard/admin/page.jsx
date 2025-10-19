// app/dashboard/admin/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminDashboardClient from "@/components/dashboard/business/adminDashboardClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/unauthorised");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      adminOfBusiness: {
        include: {
          housesAsBusiness: {
            include: {
              area: true,
              manager: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          memberships: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/unauthorised");
  }

  // Group houses by area
  const houses = user.adminOfBusiness?.housesAsBusiness || [];
  const groupedData = houses.reduce((acc, house) => {
    const area = house.area?.name || "Unassigned";
    if (!acc[area]) acc[area] = [];
    acc[area].push(house);
    return acc;
  }, {});

  return (
    <AdminDashboardClient 
      user={user}
      groupedData={groupedData}
      hasOnboarded={user.adminOnboarded}
    />
  );
}

