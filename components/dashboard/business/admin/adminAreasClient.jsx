"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Users,
  Home,
  Edit,
  //Plus,
} from "lucide-react";
import StatusMessage from "@/components/shared/statusMessage";

export default function AdminAreasClient({ areas }) {
  const [status, setStatus] = useState("");
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
          {/* <Link
            href="/dashboard/admin/areas/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Area
          </Link> */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {areas.map((area) => (
              <div key={area.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-6 h-6 text-blue-600" />
                      <h3 className="text-2xl font-bold text-gray-900">{area.name}</h3>
                    </div>
                  </div>
                  
                  <Link
                    href={`/dashboard/admin/areas/${area.id}/edit`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit area"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Coordinators</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {area._count.coordinators}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Managers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {area.managers}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Home className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Houses</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {area._count.houses}
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium">Residents</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {area.totalResidents}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}