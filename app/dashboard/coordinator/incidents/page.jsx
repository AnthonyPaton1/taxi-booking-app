// app/dashboard/coordinator/incidents/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoordinatorIncidentsClient from "@/components/dashboard/business/coordinator/coordinatorIncidentsClient";

export default async function CoordinatorIncidentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");x
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      area: true,
    },
  });

  if (!user || user.role !== "COORDINATOR" || !user.businessId) {
    redirect("/dashboard");
  }

  // Get incidents for the coordinator's business (and optionally their area)
  const incidents = await prisma.incident.findMany({
    where: {
      businessId: user.businessId,
      // Optionally filter by area if you want coordinators to only see their area
      // user: {
      //   areaId: user.areaId,
      // },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      house: {
        select: {
          label: true,
          line1: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <CoordinatorIncidentsClient incidents={incidents} />;
}