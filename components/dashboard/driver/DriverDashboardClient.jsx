// components/dashboard/driver/DriverDashboardClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Car, FileText  } from "lucide-react";
import IncidentFeedbackForm from "@/components/forms/incidentFeedbackForm";
import RecentBidsSection from "@/components/dashboard/driver/recentBidsSection";


export default function DriverDashboardClient({
  user,
  driver,
  stats,
  todaysBookings,
  availableInstant,
  availableAdvanced,
  recentBids
}) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  // Extract booking arrays
  const todaysInstant = todaysBookings?.instant || [];
  const todaysAdvanced = todaysBookings?.advanced || [];
  const totalToday = todaysInstant.length + todaysAdvanced.length;
  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {driver?.name || user?.name}!
              </h1>
              <ClientDate />
            </div>
            <div className="flex items-center gap-4">
              
            </div>
              <button
                onClick={() => setShowIncidentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Incident & Feedback</span>
              </button>
            <Car className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Jobs"
            value={stats?.todaysJobs || totalToday}
            color="blue"
          />
          <StatCard
            title="Upcoming Jobs"
            value={stats?.upcomingJobs || 0}
            color="green"
          />
          <StatCard
            title="Completed"
            value={stats?.completedJobs || 0}
            color="purple"
          />
          <StatCard
            title="Earnings"
            value={`£${((stats?.totalEarnings || 0) / 100).toFixed(2)}`}
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <QuickActionCard
    title="Available Instant Bookings"
    count={availableInstant?.length || 0}
    href="/dashboard/driver/available-instant"
    color="blue"
  />
  <QuickActionCard
    title="Advanced Bookings (Bids)"
    count={availableAdvanced?.length || 0}
    href="/dashboard/driver/available-advanced"
    color="green"
  />
  <QuickActionCard
    title="Today's Schedule"
    count={totalToday}
    href="/dashboard/driver/schedule"
    color="purple"
  />
  <QuickActionCard
    title="Weekly Schedule"
    count={stats?.upcomingJobs || 0}
    href="/dashboard/driver/weekly-schedule"
    color="orange"
  />
</div>

        {/* Today's Jobs Preview */}
        {totalToday > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Jobs
              </h2>
              <Link
                href="/dashboard/driver/weekly-schedule"
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {todaysInstant.slice(0, 3).map((booking) => (
                <JobPreview key={booking.id} booking={booking} type="instant" />
              ))}
              {todaysAdvanced.slice(0, 3).map((booking) => (
                <JobPreview key={booking.id} booking={booking} type="advanced" />
              ))}
            </div>
          </div>
        )}

        {/* Availability Toggle & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Availability</h2>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                isAvailable
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-white hover:bg-gray-500"
              }`}
            >
              {isAvailable ? "🟢 Online" : "🔴 Offline"}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isAvailable
                ? "You're visible to customers"
                : "You won't receive new bookings"}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Compliance Status</h2>
            <div className="space-y-2 text-sm">
              <ComplianceItem
                label="DBS Check"
                status={driver?.compliance?.dbsChecked}
              />
              <ComplianceItem
                label="Insurance"
                status={driver?.compliance?.fullyCompInsurance}
              />
              <ComplianceItem
                label="License"
                status={driver?.compliance?.ukDrivingLicence}
              />
            </div>
            <Link
              href="/dashboard/driver/edit"
              className="mt-4 block text-center text-sm text-blue-600 hover:underline"
            >
              Edit Driver Details
            </Link>
          </div>
        </div>
        {/* Recent Bids Section (Right) */}
          <RecentBidsSection bids={recentBids} />
      </div>
      {/* Incident Form Modal */}
            {showIncidentForm && (
              <IncidentFeedbackForm
                user={user}
                onClose={() => setShowIncidentForm(false)}
              />
            )}
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <h3 className="text-sm font-medium opacity-75">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

// Quick Action Card
const QuickActionCard = ({ title, count, href, color }) => {
  const colors = {
    blue: "border-blue-200 hover:bg-blue-50",
    green: "border-green-200 hover:bg-green-50",
    purple: "border-purple-200 hover:bg-purple-50",
  };

  return (
    <Link
      href={href}
      className={`block bg-white border-2 ${colors[color]} rounded-lg p-6 transition-colors`}
    >
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-4xl font-bold text-gray-900 mt-2">{count}</p>
      <p className="text-sm text-gray-500 mt-2">Click to view →</p>
    </Link>
  );
};

// Job Preview
const JobPreview = ({ booking, type }) => {
  const pickupTime = new Date(booking.pickupTime);
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-blue-600">
          {pickupTime.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="text-sm text-gray-700">
          {booking.pickupLocation} → {booking.dropoffLocation}
        </span>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded ${
          type === "instant"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {type === "instant" ? "Instant" : "Advanced"}
      </span>
    </div>
  );
};

// Compliance Item
const ComplianceItem = ({ label, status }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}</span>
    <span className={status ? "text-green-600" : "text-red-600"}>
      {status ? "✓ Valid" : "✗ Missing"}
    </span>
  </div>
);

// Client-only date to avoid hydration mismatch
function ClientDate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-gray-600">Loading date...</p>;
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