// app/dashboard/coordinator/houses/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoordinatorHousesClient from "@/components/dashboard/business/coordinator/coordinatorHousesClient";

export default async function CoordinatorHousesPage() {
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

  // Get all houses in this coordinator's area
  const houses = await prisma.house.findMany({
    where: {
      areaId: user.areaId,
    },
    include: {
      manager: {
        select: {
          name: true,
          email: true,
        },
      },
      residents: true,
      area: true,
    },
    orderBy: {
      label: "asc",
    },
  });

  return (
    <CoordinatorHousesClient
      houses={houses}
      coordinatorArea={user.area?.name || "Unknown Area"}
    />
  );
}