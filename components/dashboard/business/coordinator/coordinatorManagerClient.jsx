"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Home,
  Mail,
  Phone,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";

export default function CoordinatorManagersClient({ managers, coordinatorArea }) {
  const [status, setStatus] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/coordinator"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Managers
              </h1>
              <p className="text-gray-600 mt-1">
                Area: {coordinatorArea} • {managers.length} manager
                {managers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/coordinator/managers/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Manager
          </Link>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        {/* Managers List */}
        {managers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No managers yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first house manager to get started
            </p>
            <Link
              href="/dashboard/coordinator/managers/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add First Manager
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {managers.map((manager) => {
              const totalResidents = manager.houses.reduce(
                (sum, house) => sum + house.residents.length,
                0
              );
              const lastLogin = manager.lastLogin
                ? new Date(manager.lastLogin).toLocaleDateString("en-GB")
                : "Never";

              return (
                <div
                  key={manager.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {manager.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {manager.managerOnboarded ? (
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

                    <Link
                      href={`/dashboard/coordinator/managers/${manager.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit manager"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{manager.email}</span>
                    </div>
                    {manager.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{manager.phone}</span>
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
                        <Home className="w-4 h-4" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {manager.houses.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        House{manager.houses.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalResidents}
                      </p>
                      <p className="text-sm text-gray-600">
                        Resident{totalResidents !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Houses List */}
                  {manager.houses.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Houses:
                      </p>
                      <div className="space-y-1">
                        {manager.houses.map((house) => (
                          <div
                            key={house.id}
                            className="text-sm text-gray-600 flex justify-between items-center"
                          >
                            <span>{house.label}</span>
                            <span className="text-xs text-gray-500">
                              {house.residents.length} resident
                              {house.residents.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
