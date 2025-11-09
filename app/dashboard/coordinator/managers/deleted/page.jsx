// app/dashboard/coordinator/managers/deleted/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Trash2, Users, Home, RotateCcw } from "lucide-react";

export default async function DeletedManagersPage() {
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

  // Get deleted managers
  const deletedManagers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      areaId: user.areaId,
      deletedAt: { not: null }, // Only deleted
    },
    include: {
      houses: true,
    },
    orderBy: {
      deletedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/coordinator/managers"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Managers
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Deleted Managers</h1>
              <p className="text-gray-600 mt-1">
                Audit log of removed managers
              </p>
            </div>
          </div>
        </div>

        {/* Deleted Managers List */}
        {deletedManagers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No deleted managers
            </h3>
            <p className="text-gray-600">
              Managers you delete will appear here for audit purposes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deletedManagers.map((manager) => (
              <div
                key={manager.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-6 h-6 text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {manager.name}
                      </h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        DELETED
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Email:</strong> {manager.email}
                      </p>
                      {manager.phone && (
                        <p>
                          <strong>Phone:</strong> {manager.phone}
                        </p>
                      )}
                      <p>
                        <strong>Deleted:</strong>{" "}
                        {new Date(manager.deletedAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p>
                        <strong>Houses at deletion:</strong>{" "}
                        {manager.houses.length}
                      </p>
                    </div>
                  </div>

                  {/* Optional: Restore button */}
                  {/* <button
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}