// components/dashboard/driver/RecentBidsSection.jsx
"use client";

import Link from "next/link";
import { Clock, CheckCircle, XCircle, MapPin, PoundSterling } from "lucide-react";

export default function RecentBidsSection({ bids }) {
  const previewBids = bids?.slice(0, 3) || [];
  const totalBids = bids?.length || 0;

  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "PENDING":
        return {
          icon: Clock,
          text: "Pending",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-600",
        };
      case "ACCEPTED":
        return {
          icon: CheckCircle,
          text: "Accepted",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          iconColor: "text-green-600",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          text: "Rejected",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          iconColor: "text-red-600",
        };
      default:
        return {
          icon: Clock,
          text: status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          iconColor: "text-gray-600",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Recent Bids
        </h2>
        <Link
          href="/dashboard/driver/my-bids"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View All{totalBids > 0 ? ` (${totalBids})` : ""}
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

      {/* Bid Previews */}
      {previewBids.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-600 text-lg mb-1">No bids placed yet</p>
          <p className="text-gray-500 text-sm mb-4">
            Start bidding on available jobs to earn money
          </p>
          <Link href="/dashboard/driver/available-advanced">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Browse Available Jobs
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {previewBids.map((bid) => (
            <BidPreview
              key={bid.id}
              bid={bid}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatTime={formatTime}
              getStatusConfig={getStatusConfig}
            />
          ))}
        </div>
      )}

      {/* View All Link (Bottom) */}
      {totalBids > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/driver/my-bids"
            className="block text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All {totalBids} Bids →
          </Link>
        </div>
      )}
    </div>
  );
}

// Bid Preview Card Component
function BidPreview({ bid, formatCurrency, formatDate, formatTime, getStatusConfig }) {
  const booking = bid.advancedBooking;
  const status = getStatusConfig(bid.status);
  const StatusIcon = status.icon;

  return (
    <Link href={`/dashboard/driver/my-bids?highlight=${bid.id}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.textColor}`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.text}
              </span>
              {booking.accessibilityProfile?.requiresWheelchair && (
                <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                  WAV
                </span>
              )}
            </div>

            {/* Journey Details */}
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2 text-blue-600"
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
                <span className="font-medium">
                  {formatDate(booking.pickupTime)} at {formatTime(booking.pickupTime)}
                </span>
              </div>

              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.pickupLocation}
                  </p>
                  <p className="text-gray-500">→ {booking.dropoffLocation}</p>
                </div>
              </div>
            </div>

            {/* Bid timestamp */}
            <p className="text-xs text-gray-500 mt-2">
              Bid placed {formatDate(bid.createdAt)} at {formatTime(bid.createdAt)}
            </p>
          </div>

          {/* Bid Amount */}
          <div className="text-right ml-4">
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
              <PoundSterling className="w-3 h-3" />
              <span>Your bid</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(bid.amountCents)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}