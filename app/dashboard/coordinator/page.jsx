// app/dashboard/coordinator/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoordinatorDashboardClient from "@/components/dashboard/business/coordinatorDashboardClient";

export default async function CoordinatorPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/unauthorised");
  }

  // Fetch coordinator data
  const coordinator = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      houses: {
        include: {
          area: true,
        },
      },
      business: true,
    },
  });

  if (!coordinator) {
    redirect("/unauthorised");
  }
  

  // Group houses by area
  const groupedData = coordinator.houses?.reduce((acc, house) => {
    const area = house.area?.name || "Unassigned";
    if (!acc[area]) acc[area] = [];
    acc[area].push(house);
    return acc;
  }, {}) || {};

  return (
    <CoordinatorDashboardClient 
      coordinator={coordinator}
      groupedData={groupedData}
      hasOnboarded={coordinator.coordinatorOnboarded} 
    />
  );
}