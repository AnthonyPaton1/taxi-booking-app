"use client";

import { format } from "date-fns";
import { Calendar, MapPin, User, Wheelchair, Volume2, UserCircle2 } from "lucide-react";

export default function TripCard({ trip, onRepeat }) {
  // Format date for display
  const tripDate = format(new Date(trip.pickupDateTime), "PPP"); // e.g., "Jan 15, 2025"
  const timeAgo = getTimeAgo(trip.pickupDateTime);

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all hover:shadow-md">
      {/* Header: Passenger & Date */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
            <User className="w-4 h-4" />
            {trip.passenger.initials}
          </span>
          {trip.tripPurpose && (
            <h3 className="font-semibold text-lg mt-2">{trip.tripPurpose}</h3>
          )}
        </div>
        <span className="text-sm text-gray-500">{timeAgo}</span>
      </div>

      {/* Route */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-600 text-xs">From</p>
            <p className="font-medium">{trip.pickupLocation}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-600 text-xs">To</p>
            <p className="font-medium">{trip.dropoffLocation}</p>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Calendar className="w-4 h-4" />
        <span>{tripDate}</span>
      </div>

      {/* Accessibility Features */}
      {trip.accessibilityRequirements && trip.accessibilityRequirements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {trip.wheelchairUsers > 0 && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Wheelchair className="w-3 h-3" />
              {trip.wheelchairUsers} wheelchair{trip.wheelchairUsers > 1 ? "s" : ""}
            </span>
          )}
          
          {trip.accessibilityRequirements.includes("QUIET_ENVIRONMENT") && (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Quiet
            </span>
          )}
          
          {trip.accessibilityRequirements.includes("FEMALE_DRIVER") && (
            <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs flex items-center gap-1">
              <UserCircle2 className="w-3 h-3" />
              Female driver
            </span>
          )}
          
          {/* Add more accessibility badges as needed */}
        </div>
      )}

      {/* Driver Info (if completed) */}
      {trip.driver && (
        <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded">
          <p className="text-xs text-gray-500">Driver</p>
          <p className="font-medium">{trip.driver.user.name}</p>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-4">
        <StatusBadge status={trip.status} />
      </div>

      {/* Repeat Button */}
      <button
        onClick={() => onRepeat(trip)}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg 
          className="w-5 h-5" 
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
        Repeat This Trip
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

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    COMPLETED: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
    },
    IN_PROGRESS: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "In Progress",
    },
    ACCEPTED: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Upcoming",
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: status,
  };

  return (
    <span className={`${config.bg} ${config.text} px-2 py-1 rounded text-xs font-medium`}>
      {config.label}
    </span>
  );
}