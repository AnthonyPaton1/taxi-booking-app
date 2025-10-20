"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Users,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default function HousesManagementClient({ houses, userName }) {
  const [expandedHouseId, setExpandedHouseId] = useState(null);

  const toggleHouse = (houseId) => {
    setExpandedHouseId(expandedHouseId === houseId ? null : houseId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/manager"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Houses</h1>
          </div>
          <Link
            href="/dashboard/manager/houses/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add House
          </Link>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {userName}
          </h2>
          <p className="text-gray-600">
            You manage {houses.length} {houses.length === 1 ? "house" : "houses"}{" "}
            with a total of{" "}
            {houses.reduce((sum, house) => sum + house.residents.length, 0)} residents
          </p>
        </div>

        {/* Houses List */}
        {houses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No houses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first house to start managing residents and bookings
            </p>
            <Link
              href="/dashboard/manager/houses/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Your First House
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {houses.map((house) => (
              <div
                key={house.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* House Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Home className="w-6 h-6 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          {house.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>{house.line1}</p>
                            {house.line2 && <p>{house.line2}</p>}
                            <p>
                              {house.city}, {house.postcode}
                            </p>
                            {house.area && (
                              <p className="text-gray-500 mt-1">
                                Area: {house.area.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {house.residents.length}{" "}
                              {house.residents.length === 1
                                ? "Resident"
                                : "Residents"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {house.stats.upcomingBookings} upcoming bookings
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/manager/houses/${house.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit house"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => toggleHouse(house.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title={
                          expandedHouseId === house.id
                            ? "Hide residents"
                            : "Show residents"
                        }
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform ${
                            expandedHouseId === house.id ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Residents List (Expandable) */}
                {expandedHouseId === house.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">
                        Residents ({house.residents.length})
                      </h4>
                      <Link
                        href={`/dashboard/manager/houses/${house.id}/residents/add`}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Resident
                      </Link>
                    </div>

                    {house.residents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No residents added yet</p>
                        <Link
                          href={`/dashboard/manager/houses/${house.id}/residents/add`}
                          className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Add First Resident
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {house.residents.map((resident) => (
                          <div
                            key={resident.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {resident.name}
                                </p>
                                {resident.roomNumber && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Room {resident.roomNumber}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Link
                                  href={`/dashboard/manager/houses/${house.id}/residents/${resident.id}/edit`}
                                  className="p-1 text-gray-500 hover:text-blue-600 rounded"
                                  title="Edit resident"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Delete ${resident.name}? This will also delete all their bookings.`
                                      )
                                    ) {
                                      // TODO: Implement delete
                                      console.log("Delete resident:", resident.id);
                                    }
                                  }}
                                  className="p-1 text-gray-500 hover:text-red-600 rounded"
                                  title="Delete resident"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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