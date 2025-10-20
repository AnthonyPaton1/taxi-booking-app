"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Users,
  MapPin,
  User,
  Search,
  Filter,
} from "lucide-react";

export default function AdminHousesClient({
  houses,
  areas,
  currentAreaFilter,
  totalResidents,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredHouses = houses.filter(
    (house) =>
      house.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAreaFilter = (areaId) => {
    if (areaId === "all") {
      router.push("/dashboard/admin/houses");
    } else {
      router.push(`/dashboard/admin/houses?area=${areaId}`);
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
              <h1 className="text-3xl font-bold text-gray-900">All Houses</h1>
              <p className="text-gray-600 mt-1">
                {houses.length} house{houses.length !== 1 ? "s" : ""} •{" "}
                {totalResidents} resident{totalResidents !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by house name, city, manager, or area..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={currentAreaFilter}
              onChange={(e) => handleAreaFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Houses Grid */}
        {filteredHouses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {houses.length === 0 ? "No houses yet" : "No results found"}
            </h3>
            <p className="text-gray-600">
              {houses.length === 0
                ? "Houses will appear as managers onboard them"
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <div
                key={house.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* House Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <Home className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {house.label}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{house.area.name}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="text-sm text-gray-600 mb-4">
                  <p>{house.line1}</p>
                  <p>
                    {house.city}, {house.postcode}
                  </p>
                </div>

                {/* Manager Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
                  <User className="w-4 h-4" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {house.manager.name}
                    </p>
                    <p className="text-xs text-gray-500">{house.manager.email}</p>
                  </div>
                </div>

                {/* Residents Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {house.residents.length} resident
                      {house.residents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {house.residents.length > 0 && (
                    <button
                      onClick={() => {
                        const residentsList = house.residents
                          .map((r) => `${r.name} (${r.initials})`)
                          .join("\n");
                        alert(`Residents:\n\n${residentsList}`);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      View list
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}