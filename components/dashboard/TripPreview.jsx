"use client";

import { MapPin, User } from "lucide-react";
import { format } from "date-fns";

export default function TripPreview({ trip, onRepeat }) {
  const timeAgo = getTimeAgo(trip.pickupDateTime);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all bg-white">
      {/* Passenger & Time */}
      <div className="flex justify-between items-start mb-2">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1">
          <User className="w-3 h-3" />
          {trip.passenger.initials}
        </span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      {/* Route (Compact) */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
          <p className="font-medium text-gray-900 truncate">{trip.pickupLocation}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 ml-5">
          <span>→</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
          <p className="font-medium text-gray-900 truncate">{trip.dropoffLocation}</p>
        </div>
      </div>

      {/* Trip Purpose (if exists) */}
      {trip.tripPurpose && (
        <p className="text-sm text-gray-600 mb-3 truncate">{trip.tripPurpose}</p>
      )}

      {/* Quick Info Badges */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        {trip.wheelchairUsers > 0 && (
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
            ♿ {trip.wheelchairUsers}
          </span>
        )}
        {trip.accessibilityRequirements?.includes("QUIET_ENVIRONMENT") && (
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
            🤫 Quiet
          </span>
        )}
      </div>

      {/* Repeat Button */}
      <button
        onClick={() => onRepeat(trip)}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        Repeat Trip
      </button>
    </div>
  );
}

// Helper function to get "X days ago" text
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}