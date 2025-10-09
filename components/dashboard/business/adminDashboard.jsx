// components/dashboard/business/adminDashboard.jsx
"use client";

import AdminStats from "./adminDashboardStats";

export default function AdminDashboard({ groupedData }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-blue-800">
            Welcome to the Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Control panel for managing users, drivers, and more.
          </p>
        </div>
      </div>

      <AdminStats groupedData={groupedData} />

      {Object.entries(groupedData).map(([area, houses]) => (
        <div key={area} className="mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📍 {area}</h2>
          <div className="space-y-4">
            {houses.map((house) => (
              <div
                key={house.id}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <p className="font-semibold text-gray-800">
                  🏠 {house.label} — {house.line1}, {house.postcode}
                </p>
                <p className="text-sm text-gray-600">
                  Internal ID: {house.internalId} | PIN: {house.pin}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}