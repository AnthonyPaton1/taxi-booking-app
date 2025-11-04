// app/dashboard/admin/incidents/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminIncidentsClient from "@/components/dashboard/business/admin/AdminIncidentsClient";

export default async function AdminIncidentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adminOfBusiness: true,
    },
  });

  if (!user || user.role !== "ADMIN" || !user.adminOfBusiness) {
    redirect("/dashboard");
  }

  // Get all incidents for the business
  const incidents = await prisma.incident.findMany({
    where: {
      businessId: user.adminOfBusiness.id,
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

  return <AdminIncidentsClient incidents={incidents} />;
}