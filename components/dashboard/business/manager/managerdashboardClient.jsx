// components/dashboard/manager/ManagerDashboardClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import IncidentFeedbackForm from "@/components/forms/incidentFeedbackForm";
import { FileText, Building } from "lucide-react";
import RecentTripsSection from "@/components/dashboard/RecentTripsSection";

export default  function ManagerDashboardClient({
  user,
  houses,
  upcomingBookings,
  stats,
  recentTrips,
  houseId
}) {
  const [showIncidentForm, setShowIncidentForm] = useState(false);
 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}
              </h1>
              <ClientDate />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowIncidentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Incident & Feedback</span>
              </button>
              <Building className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Your Houses"
            value={stats.totalHouses}
            color="blue"
            icon="🏠"
          />
          <StatCard
            title="Upcoming Rides"
            value={stats.upcomingRides}
            color="green"
            icon="🚗"
          />
          <StatCard
            title="Pending Bids"
            value={stats.pendingBids}
            color="yellow"
            icon="⏳"
            highlight={stats.pendingBids > 0}
          />
          <StatCard
            title="Completed"
            value={stats.completedRides}
            color="purple"
            icon="✓"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Book Advanced Ride"
            description="Schedule transport 48hrs+ ahead"
            href="/dashboard/manager/book-ride"
            color="blue"
            icon="📅"
          />
          <QuickAction
            title="Book Instant Ride"
            description="Request immediate transport"
            href="/dashboard/manager/instant-booking"
            color="purple"
            icon="⚡"
          />
          <QuickAction
            title="View All Bookings"
            description="Manage all transport requests"
            href="/dashboard/manager/bookings"
            color="green"
            icon="📋"
          />
        </div>

        {/* Bookings Needing Attention */}
        {stats.pendingBids > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900">
                  {stats.pendingBids} booking{stats.pendingBids !== 1 ? "s" : ""}{" "}
                  need your attention
                </h3>
                <p className="text-sm text-yellow-800">
                  Bids have been received - review and accept to confirm drivers
                </p>
              </div>
              <Link
                href="/dashboard/manager/pending-bids"
                className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
              >
                Review Bids
              </Link>
            </div>
          </div>
        )}

         {/* 🔥 NEW: Recent Trips Section (Full Width) */}
          <div className="lg:col-span-2">
            <RecentTripsSection 
              trips={recentTrips} 
              houseId={houseId}
            />
          </div>

        {/* Upcoming Bookings */}
<div className="bg-white rounded-lg shadow-sm p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold text-gray-900">
      Upcoming Bookings
    </h2>
    <Link
      href="/dashboard/manager/bookings"
      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
    >
      View All
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5l7 7-7 7" 
        />
      </svg>
    </Link>
  </div>
  
  {upcomingBookings.length === 0 ? (
    <div className="text-center py-12">
      <svg
        className="w-16 h-16 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-gray-600 text-lg mb-1">No upcoming bookings</p>
      <p className="text-gray-500 text-sm">
        Use the quick actions above to create a booking
      </p>
    </div>
  ) : (
    <div className="space-y-3">
      {upcomingBookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )}
</div>

        {/* Houses Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Houses</h2>
            <Link
              href="/dashboard/manager/houses"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {houses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        </div>
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

// Stat Card
const StatCard = ({ title, value, color, icon, highlight }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div
      className={`${colors[color]} ${
        highlight ? "ring-2 ring-yellow-400" : ""
      } border rounded-lg p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
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

// Booking Card Preview
const BookingCard = ({ booking }) => {
  const pickupTime = new Date(booking.pickupTime);
  const hasBids = booking.bids && booking.bids.length > 0;
  const isAccepted = booking.status === "ACCEPTED";

  return (
    <Link
      href={`/dashboard/manager/bookings/${booking.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {pickupTime.toLocaleDateString("en-GB")} at{" "}
              {pickupTime.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isAccepted ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ✓ Confirmed
              </span>
            ) : hasBids ? (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                {booking.bids.length} bid{booking.bids.length !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                Awaiting bids
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600">
            {booking.pickupLocation} → {booking.dropoffLocation}
          </p>

          {isAccepted && booking.acceptedBid && (
            <p className="text-sm text-green-700 mt-2">
              Driver: {booking.acceptedBid.driver.name} •{" "}
              {booking.acceptedBid.driver.phone}
            </p>
          )}
        </div>

        {!isAccepted && hasBids && (
          <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">
            Review Bids
          </button>
        )}
      </div>
    </Link>
  );
};

// House Card
const HouseCard = ({ house }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h3 className="font-semibold text-gray-900">{house.label}</h3>
    <p className="text-sm text-gray-600 mt-1">
      {house.line1}, {house.city}
    </p>
    <p className="text-sm text-gray-600">{house.postcode}</p>
    {house.area && (
      <p className="text-xs text-gray-500 mt-2">Area: {house.area.name}</p>
    )}
    <p className="text-xs text-gray-500">Residents: {house.tenants}</p>
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