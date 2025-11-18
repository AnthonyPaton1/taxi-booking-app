"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";
import StatusMessage from "@/components/shared/statusMessage";

export default function AdminCoordinatorsClient({ coordinators, areas }) {
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  const handleDelete = async (coordinatorId, userName) => {
    if (
      !confirm(
        `Delete ${userName}?\n\nThis will remove their coordinator access but keep their user account. They will no longer be able to manage their area.`
      )
    ) {
      return;
    }

    setStatus("loading");
    setDeleting(coordinatorId);

    try {
      const res = await fetch(`/api/admin/coordinators/${coordinatorId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Coordinator removed successfully");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setStatus("❌ " + (data.error || "Failed to remove coordinator"));
      }
    } catch (err) {
      console.error("Error deleting coordinator:", err);
      setStatus("❌ Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Coordinators
              </h1>
              <p className="text-gray-600 mt-1">
                {coordinators.length} coordinator
                {coordinators.length !== 1 ? "s" : ""} across {areas.length}{" "}
                area{areas.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/coordinator/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Coordinator
          </Link>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        {/* Coordinators List */}
        {coordinators.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No coordinators yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first area coordinator to get started
            </p>
            <Link
              href="/dashboard/admin/coordinator/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add First Coordinator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coordinators.map((coordinator) => {
              const lastLogin = coordinator.user.lastLogin
                ? new Date(coordinator.user.lastLogin).toLocaleDateString(
                    "en-GB"
                  )
                : "Never";

              return (
                <div
                  key={coordinator.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {coordinator.user.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {coordinator.area.name}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          {coordinator.user.coordinatorOnboarded ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Onboarded
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <XCircle className="w-4 h-4" />
                              Pending Setup
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/admin/coordinators/${coordinator.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit coordinator"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(coordinator.id, coordinator.user.name)
                        }
                        disabled={status === "loading" && deleting === coordinator.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove coordinator"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{coordinator.user.email}</span>
                    </div>
                    {coordinator.user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{coordinator.user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Last login: {lastLogin}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {coordinator.stats.managers}
                      </p>
                      <p className="text-sm text-gray-600">
                        Manager{coordinator.stats.managers !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                        <Home className="w-4 h-4" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {coordinator.stats.houses}
                      </p>
                      <p className="text-sm text-gray-600">
                        House{coordinator.stats.houses !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Added Date */}
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Added{" "}
                    {new Date(coordinator.user.createdAt).toLocaleDateString(
                      "en-GB"
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}