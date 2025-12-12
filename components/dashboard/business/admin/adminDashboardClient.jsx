"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  Users,
  Home,
  MapPin,
  Calendar,
  MessageSquare,
  Database
} from "lucide-react";
import ResendInvitationButton from "@/components/ResendInvitationButton";

export default function AdminDashboardClient({
  user,
  business,
  areas,
  coordinators,
  stats,
}) {
  const router = useRouter()


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
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/admin/export')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Database className="w-5 h-5" />
            <span className="hidden sm:inline">Data Export</span>
          </button>
          
          <Building className="w-12 h-12 text-blue-600" />
        </div>
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
            title="Current Areas"
            description="See all geographic areas and assigned coordinators"
            href="/dashboard/admin/areas"
            color="blue"
            icon="🗺️"
          />
          <QuickAction
            title="Manage Coordinators"
            description="Create areas and assign coordinators to oversee managers and houses"
            href="/dashboard/admin/coordinator"
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
            description="Review Incident forms"
            href="/dashboard/admin/incidents"
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
      {area.users?.length || 0}
    </span>
  </div>
  <div className="flex justify-between">
    <span>Houses:</span>
    <span className="font-medium">
      {area._count.house}
    </span>
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
      Your Coordinators
    </h2>
    <Link
      href="/dashboard/admin/coordinator"
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
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="text-gray-600">{coordinator.email}</p>
              <span
                className={`text-xs ${
                  coordinator.coordinatorOnboarded
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {coordinator.coordinatorOnboarded
                  ? "✓ Onboarded"
                  : "⏳ Pending"}
              </span>
            </div>
            
            {/* Resend Button - only show if not onboarded */}
            {!coordinator.coordinatorOnboarded && (
              <ResendInvitationButton
                userId={coordinator.id}
                userEmail={coordinator.email}
                userName={coordinator.name}
                size="sm"
                variant="outline"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Add Manager CTA - Only shows when no coordinators */}
        {coordinators.length === 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <p className="text-blue-700 font-bold mb-2">
              Add your Area Managers or Coordinators below
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Coordinators manage multiple houses across an area. They will each
              receive an email to complete their assigned areas and onboard their
              House Managers.
            </p>

            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Single location?</strong> If you only have one care home
                or location, you can skip adding coordinators and go straight to
                adding your House Manager.
              </p>
              <Link
                href="/dashboard/admin/houses"
                className="inline-block text-sm text-blue-600 font-medium underline hover:text-blue-800"
              >
                Skip Coordinators & Add Manager Instead →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




// Stat Card
const StatCard = ({ title, value, color, icon }) => {
  const colors = {
    blue: "bg-blue-200 text-black border-blue-400",
    green: "bg-green-200 text-black border-green-400",
    purple: "bg-purple-200 text-black border-purple-400",
    yellow: "bg-yellow-200 text-black border-yellow-400",
    indigo: "bg-indigo-200 text-black  border-indigo-400",
    pink: "bg-pink-200 text-black  border-pink-400",
    orange: "bg-orange-200 text-black  border-orange-400",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="text-xs font-medium opacity-75">{title}</h2>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Quick Action Card
const QuickAction = ({ title, description, href, color, icon }) => {
  const colors = {
    blue: "border-blue-400 hover:bg-blue-200",
    green: "border-green-400 hover:bg-green-200",
    purple: "border-purple-400 hover:bg-purple-200",
    orange: "border-orange-400 hover:bg-orange-200",
  };

  return (
    <Link
      href={href}
      className={`block bg-white border-2 ${colors[color]} rounded-lg p-6 transition-colors`}
    >
      <span className="text-3xl block mb-2">{icon}</span>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
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