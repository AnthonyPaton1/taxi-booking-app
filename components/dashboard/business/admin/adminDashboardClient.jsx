"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Users,
  Home,
  MapPin,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";

export default function AdminDashboardClient({
  user,
  business,
  areas,
  coordinators,
  managers,
  houses,
  stats,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user.name} • {business.name}
              </p>
              <ClientDate />
            </div>
            <Building className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            title="Areas"
            value={stats.totalAreas}
            color="blue"
            icon={<MapPin className="w-5 h-5" />}
          />
          <StatCard
            title="Coordinators"
            value={stats.totalCoordinators}
            color="purple"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Managers"
            value={stats.totalManagers}
            color="green"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Houses"
            value={stats.totalHouses}
            color="yellow"
            icon={<Home className="w-5 h-5" />}
          />
          <StatCard
            title="Residents"
            value={stats.totalResidents}
            color="indigo"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Bookings"
            value={stats.totalBookings}
            color="pink"
            icon={<Calendar className="w-5 h-5" />}
          />
          <StatCard
            title="Feedback"
            value={stats.feedbackCount}
            color="orange"
            icon={<MessageSquare className="w-5 h-5" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Manage Areas"
            description="View and edit areas"
            href="/dashboard/admin/areas"
            color="blue"
            icon="🗺️"
          />
          <QuickAction
            title="Manage Coordinators"
            description="View, add, remove coordinators"
            href="/dashboard/admin/coordinators"
            color="purple"
            icon="👥"
          />
          <QuickAction
            title="View All Houses"
            description="See houses across all areas"
            href="/dashboard/admin/houses"
            color="green"
            icon="🏘️"
          />
          <QuickAction
            title="Feedback & Complaints"
            description="Review user feedback"
            href="/dashboard/admin/feedback"
            color="orange"
            icon="💬"
          />
        </div>

        {/* Areas Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Areas Overview
            </h2>
            <Link
              href="/dashboard/admin/areas"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {areas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No areas configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/dashboard/admin/areas/${area.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{area.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Coordinators:</span>
                      <span className="font-medium">
                        {area._count.coordinators}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Houses:</span>
                      <span className="font-medium">{area._count.houses}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Coordinators Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Coordinators
            </h2>
            <Link
              href="/dashboard/admin/coordinators"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {coordinators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No coordinators added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
  {coordinators.slice(0, 5).map((coordinator) => (
    <div
      key={coordinator.id}
      className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
    >
      <div>
        <p className="font-medium text-gray-900">
          {coordinator.name}
        </p>
        <p className="text-sm text-gray-600">
          {coordinator.area?.name}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="text-gray-600">{coordinator.email}</p>
        <span
          className={`text-xs ${
            coordinator.coordinatorOnboarded
              ? "text-green-600"
              : "text-yellow-600"
          }`}
        >
          {coordinator.coordinatorOnboarded
            ? "✓ Onboarded"
            : "⏳ Pending"}
        </span>
      </div>
    </div>
  ))}
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card
const StatCard = ({ title, value, color, icon }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-xs font-medium opacity-75">{title}</h3>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Quick Action Card
const QuickAction = ({ title, description, href, color, icon }) => {
  const colors = {
    blue: "border-blue-200 hover:bg-blue-50",
    green: "border-green-200 hover:bg-green-50",
    purple: "border-purple-200 hover:bg-purple-50",
    orange: "border-orange-200 hover:bg-orange-50",
  };

  return (
    <Link
      href={href}
      className={`block bg-white border-2 ${colors[color]} rounded-lg p-6 transition-colors`}
    >
      <span className="text-3xl block mb-2">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  );
};

// Client Date Component
function ClientDate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-gray-600">Loading...</p>;
  }

  return (
    <p className="text-gray-600 text-sm">
      {new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}