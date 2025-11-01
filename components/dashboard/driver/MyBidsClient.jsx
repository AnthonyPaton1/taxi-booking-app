// components/dashboard/driver/MyBidsClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  PoundSterling,
  TrendingUp,
  ArrowLeft,
  Eye,
} from "lucide-react";

export default function MyBidsClient({
  pendingBids,
  acceptedBids,
  rejectedBids,
  stats,
  driverName,
}) {
  const [activeTab, setActiveTab] = useState("pending");

  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const tabs = [
    { id: "pending", label: "Pending", count: stats.pending, icon: Clock },
    { id: "accepted", label: "Accepted", count: stats.accepted, icon: CheckCircle },
    { id: "rejected", label: "Rejected", count: stats.rejected, icon: XCircle },
  ];

  const getCurrentBids = () => {
    switch (activeTab) {
      case "pending":
        return pendingBids;
      case "accepted":
        return acceptedBids;
      case "rejected":
        return rejectedBids;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard/driver">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600 mt-1">Track all your bid activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Bids"
            value={stats.total}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            icon="🎯"
            color="green"
          />
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon="💰"
            color="yellow"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon="⏳"
            color="orange"
            highlight={stats.pending > 0}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bids List */}
          <div className="p-6">
            {getCurrentBids().length === 0 ? (
              <EmptyState activeTab={activeTab} />
            ) : (
              <div className="space-y-4">
                {getCurrentBids().map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    status={activeTab}
                    formatCurrency={formatCurrency}
                    formatDateTime={formatDateTime}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, highlight }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <div
      className={`${colors[color]} ${
        highlight ? "ring-2 ring-orange-400" : ""
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

// Bid Card Component
const BidCard = ({ bid, status, formatCurrency, formatDateTime, formatDate }) => {
  const booking = bid.advancedBooking;

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Won Bid
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Not Selected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        status === "accepted"
          ? "border-green-200 bg-green-50"
          : status === "rejected"
          ? "border-gray-200 bg-gray-50"
          : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge()}
            {booking.accessibilityProfile?.requiresWheelchair && (
              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                WAV
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">
                  {formatDate(booking.pickupTime)}
                </p>
                <p className="text-sm text-gray-600">
                  Pickup: {formatDateTime(booking.pickupTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900 font-medium">
                  {booking.pickupLocation}
                </p>
                <p className="text-sm text-gray-600">→ {booking.dropoffLocation}</p>
              </div>
            </div>

            {booking.accessibilityProfile?.initials && (
              <p className="text-xs text-gray-500">
                Passenger: {booking.accessibilityProfile.initials} •{" "}
                {booking.passengerCount} {booking.passengerCount === 1 ? "person" : "people"}
              </p>
            )}
          </div>
        </div>

        <div className="text-right ml-4">
          <div className="flex flex-col items-end gap-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Bid</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(bid.amountCents)}
              </p>
            </div>

            <Link href={`/dashboard/driver/bookings/${booking.id}`}>
              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bid Message */}
      {bid.message && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Your note:</span> {bid.message}
          </p>
        </div>
      )}

      {/* Bid Timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <span>Bid placed {formatDateTime(bid.createdAt)}</span>
        {status === "rejected" && (
          <span className="text-red-600">Not selected by manager</span>
        )}
        {status === "accepted" && booking.status === "COMPLETED" && (
          <span className="text-green-600 font-medium">✓ Completed</span>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ activeTab }) => {
  const messages = {
    pending: {
      icon: Clock,
      title: "No pending bids",
      description: "Browse available advanced bookings to place your bids",
      action: "View Available Jobs",
      href: "/dashboard/driver/available-advanced",
    },
    accepted: {
      icon: CheckCircle,
      title: "No accepted bids yet",
      description: "Keep bidding on jobs to start earning",
      action: "View Available Jobs",
      href: "/dashboard/driver/available-advanced",
    },
    rejected: {
      icon: XCircle,
      title: "No rejected bids",
      description: "This is a good sign! Keep up the competitive bidding.",
      action: null,
      href: null,
    },
  };

  const config = messages[activeTab];
  const Icon = config.icon;

  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-6">{config.description}</p>
      {config.action && (
        <Link href={config.href}>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {config.action}
          </button>
        </Link>
      )}
    </div>
  );
};