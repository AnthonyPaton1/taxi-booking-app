// app/dashboard/coordinator/houses/[id]/reassign/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ReassignHouseForm from "@/components/forms/business/reassignHouseForm";
import Link from "next/link";
import { ArrowLeft, Home, Users } from "lucide-react";

export default async function ReassignHousePage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.coordinatorOnboarded) {
    redirect("/dashboard/coordinator");
  }

  const { id: houseId } = await params;

  // Get the house - verify it's in coordinator's area
  const house = await prisma.house.findFirst({
    where: {
      id: houseId,
      areaId: user.areaId,
      deletedAt: null,
    },
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      residents: true,
      area: true,
    },
  });

  if (!house) {
    redirect("/dashboard/coordinator/houses");
  }

  // Get all managers in this area (excluding current manager)
  const availableManagers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      areaId: user.areaId,
      deletedAt: null,
      NOT: {
        id: house.managerId,
      },
    },
    include: {
      houses: {
        where: {
          deletedAt: null,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Format for form
  const managers = availableManagers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    housesCount: m.houses.length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/coordinator/houses"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Houses
          </Link>
        </div>

        {/* House Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-100 rounded-full p-3">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {house.label}
              </h1>
              <p className="text-gray-600">
                {house.line1}, {house.city}, {house.postcode}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Manager</p>
              <p className="font-semibold text-gray-900">{house.manager.name}</p>
              <p className="text-sm text-gray-500">{house.manager.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Residents</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <p className="font-semibold text-gray-900">
                  {house.residents.length} resident{house.residents.length !== 1 ? "s" : ""}
                </p>
              </div>
              {house.residents.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {house.residents.map((r) => r.name).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reassignment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Reassign to New Manager
          </h2>
          
          {managers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No other managers available in {house.area.name}
              </p>
              <Link
                href="/dashboard/coordinator/managers/add"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Add a new manager first
              </Link>
            </div>
          ) : (
            <ReassignHouseForm
              house={house}
              managers={managers}
              currentManagerId={house.managerId}
            />
          )}
        </div>
      </div>
    </div>
  );
}