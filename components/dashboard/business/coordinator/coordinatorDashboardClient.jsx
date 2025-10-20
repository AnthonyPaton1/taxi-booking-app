"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  Calendar,
  TrendingUp,
  AlertCircle,
  MapPin,
  Building,
  MessageSquare,
} from "lucide-react";

export default function CoordinatorDashboardClient({
  user,
  managers,
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
                Welcome, {user.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Area Coordinator - {user.area?.name || "No area assigned"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {user.business?.name || "No business assigned"}
              </p>
              <ClientDate />
            </div>
            <Building className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Managers"
            value={stats.totalManagers}
            color="blue"
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Houses"
            value={stats.totalHouses}
            color="green"
            icon={<Home className="w-6 h-6" />}
          />
          <StatCard
            title="Residents"
            value={stats.totalResidents}
            color="purple"
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Incidents"
            value={stats.incidentCount}
            color="orange"
            icon={<AlertCircle className="w-6 h-6" />}
            highlight={stats.incidentCount > 0}
          />
          <StatCard
            title="Feedback"
            value={stats.feedbackCount}
            color="yellow"
            icon={<MessageSquare className="w-6 h-6" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Manage Managers"
            description="View and onboard house managers"
            href="/dashboard/coordinator/managers"
            color="blue"
            icon="👥"
          />
          <QuickAction
            title="Incidents & Feedback"
            description="Review reports and feedback"
            href="/dashboard/coordinator/incidents"
            color="orange"
            icon="⚠️"
          />
          <QuickAction
            title="Houses Overview"
            description="View all houses in your area"
            href="/dashboard/coordinator/houses"
            color="purple"
            icon="🏘️"
          />
        </div>

        {/* Managers Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Managers
            </h2>
            <Link
              href="/dashboard/coordinator/managers"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {managers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No managers onboarded yet</p>
              <Link
                href="/dashboard/coordinator/managers/add"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add First Manager
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managers.slice(0, 6).map((manager) => (
                <ManagerCard key={manager.id} manager={manager} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Incidents & Feedback */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Incidents & Feedback
            </h2>
            <Link
              href="/dashboard/coordinator/incidents"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Incidents and feedback will appear here
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Reports submitted by managers and drivers for audit trail
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card
const StatCard = ({ title, value, color, icon, highlight }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <div
      className={`${colors[color]} ${
        highlight ? "ring-2 ring-yellow-400" : ""
      } border rounded-lg p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium opacity-75">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
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

// Manager Card
const ManagerCard = ({ manager }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-blue-100 rounded-full p-2">
        <Users className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{manager.name}</h3>
        <p className="text-sm text-gray-600">{manager.email}</p>
      </div>
    </div>
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Home className="w-4 h-4" />
        <span>
          {manager.houses.length} house{manager.houses.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span>
          {manager.houses.reduce((sum, h) => sum + h.residents.length, 0)}{" "}
          residents
        </span>
      </div>
    </div>
  </div>
);

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
    <p className="text-gray-600">
      {new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}