// app/dashboard/coordinator/managers/[id]/edit/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import EditManagerForm from "@/components/forms/business/editManagerForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditManagerPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      area: true,
      business: true,
    },
  });

  if (!user || !user.coordinatorOnboarded) {
    redirect("/dashboard/coordinator");
  }

  const { id: managerId } = await params;

  // Get the manager - verify they're in this coordinator's area
  const manager = await prisma.user.findFirst({
    where: {
      id: managerId,
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
  });

  if (!manager) {
    redirect("/dashboard/coordinator/managers");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/coordinator/managers"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Managers
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Manager: {manager.name}
          </h1>

          <EditManagerForm manager={manager} coordinatorAreaId={user.areaId} />
        </div>

        {/* Manager Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Manager Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Houses</p>
              <p className="text-2xl font-bold text-blue-900">
                {manager.houses.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium mb-1">
                Residents
              </p>
              <p className="text-2xl font-bold text-green-900">
                {manager.houses.reduce(
                  (sum, h) => sum + h.residents.length,
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}