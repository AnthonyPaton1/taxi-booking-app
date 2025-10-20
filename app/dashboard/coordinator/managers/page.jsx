// app/dashboard/coordinator/managers/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoordinatorManagersClient from "@/components/dashboard/business/coordinator/coordinatorManagerClient";

export default async function CoordinatorManagersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      area: true,
      business: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (!user || !user.coordinatorOnboarded) {
    redirect("/dashboard/coordinator");
  }

  // Get all managers in this coordinator's area
  const managers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      areaId: user.areaId,
    },
    include: {
      houses: {
        include: {
          residents: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <CoordinatorManagersClient
      managers={managers}
      coordinatorArea={user.area?.name || "Unknown Area"}
    />
  );
}