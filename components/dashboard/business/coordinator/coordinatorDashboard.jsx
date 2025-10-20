// components/dashboard/business/coordinatorDashboard.jsx
"use client";

export default function CoordinatorDashboard({ coordinator, groupedData }) {
  const totalHouses = coordinator?.houses?.length || 0;
  const totalAreas = Object.keys(groupedData || {}).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">
          Welcome back, {coordinator?.name}!
        </h1>
        <p className="text-gray-600">
          {coordinator?.business?.name || "Your Business"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">{totalAreas}</div>
          <div className="text-gray-600 text-sm">Areas Managed</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">{totalHouses}</div>
          <div className="text-gray-600 text-sm">Total Properties</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-purple-600">
            {coordinator?.business?.members?.length || 0}
          </div>
          <div className="text-gray-600 text-sm">Team Members</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Manager
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}