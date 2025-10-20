"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Users,
  Home,
  Plus,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StatusMessage from "@/components/shared/statusMessage";

export default function AdminAreasClient({ areas }) {
  const [status, setStatus] = useState("");
  const [expandedArea, setExpandedArea] = useState(null);
  const router = useRouter();

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
              <h1 className="text-3xl font-bold text-gray-900">Manage Areas</h1>
              <p className="text-gray-600 mt-1">
                {areas.length} area{areas.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/areas/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Area
          </Link>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        {/* Areas List */}
        {areas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No areas yet
            </h3>
            <p className="text-gray-600 mb-6">Add your first area to get started</p>
            <Link
              href="/dashboard/admin/areas/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add First Area
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {areas.map((area) => (
              <div key={area.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Area Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">{area.name}</h3>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {area._count.coordinators} coordinator
                            {area._count.coordinators !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {area.managers} manager{area.managers !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Home className="w-4 h-4" />
                          <span>
                            {area._count.houses} house{area._count.houses !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {area.totalResidents} resident
                            {area.totalResidents !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/admin/areas/${area.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit area"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() =>
                          setExpandedArea(expandedArea === area.id ? null : area.id)
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        {expandedArea === area.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedArea === area.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Coordinators */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Coordinators ({area.coordinators.length})
                        </h4>
                        {area.coordinators.length === 0 ? (
                          <p className="text-sm text-gray-500">No coordinators assigned</p>
                        ) : (
                          <div className="space-y-2">
                            {area.coordinators.map((coordinator) => (
                              <div
                                key={coordinator.id}
                                className="bg-white p-3 rounded border border-gray-200"
                              >
                                <p className="font-medium text-gray-900">
                                  {coordinator.user.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {coordinator.user.email}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Houses */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Recent Houses ({area.houses.length})
                        </h4>
                        {area.houses.length === 0 ? (
                          <p className="text-sm text-gray-500">No houses yet</p>
                        ) : (
                          <div className="space-y-2">
                            {area.houses.slice(0, 5).map((house) => (
                              <div
                                key={house.id}
                                className="bg-white p-3 rounded border border-gray-200"
                              >
                                <p className="font-medium text-gray-900">{house.label}</p>
                                <p className="text-sm text-gray-600">
                                  {house.residents.length} resident
                                  {house.residents.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            ))}
                            {area.houses.length > 5 && (
                              <p className="text-sm text-gray-500 text-center pt-2">
                                + {area.houses.length - 5} more
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}