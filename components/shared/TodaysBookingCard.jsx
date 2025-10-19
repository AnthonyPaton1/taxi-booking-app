// components/shared/TodaysBookingCard.jsx
"use client";

import { useState } from "react";
import { startInstantBooking, completeInstantBooking } from "@/app/actions/bookings/bidActions";
import { useRouter } from "next/navigation";

export default function TodaysBookingCard({ booking, type }) {
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const pickupTime = new Date(booking.pickupTime);
  const profile = booking.accessibilityProfile;
  const isInstant = type === "instant";

  const handleStart = async () => {
    if (!confirm("Start this journey?")) return;
    
    setUpdating(true);
    const result = await startInstantBooking(booking.id);
    
    if (result.success) {
      alert("✅ Journey started!");
      router.refresh();
    } else {
      alert(`❌ ${result.error}`);
    }
    setUpdating(false);
  };

  const handleComplete = async () => {
    if (!confirm("Mark this journey as complete?")) return;
    
    setUpdating(true);
    const result = await completeInstantBooking(booking.id);
    
    if (result.success) {
      alert("✅ Journey completed!");
      router.refresh();
    } else {
      alert(`❌ ${result.error}`);
    }
    setUpdating(false);
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!isInstant) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
          Advanced
        </span>
      );
    }

    switch (booking.status) {
      case "ACCEPTED":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            Accepted
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
            In Progress
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-l-4 border-l-blue-600 rounded-r-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">
            {pickupTime.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {getStatusBadge()}
        </div>
        {!isInstant && booking.acceptedBid && (
          <span className="text-sm font-semibold text-green-600">
            £{(booking.acceptedBid.amountCents / 100).toFixed(2)}
          </span>
        )}
      </div>

      {/* Passenger Info */}
      {booking.createdBy && (
        <p className="text-xs text-gray-500 mb-2">
          Passenger: {booking.createdBy.name || "Anonymous"}
        </p>
      )}

      {/* Locations */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium">Pickup</p>
          <p className="text-sm text-gray-900">{booking.pickupLocation}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Dropoff</p>
          <p className="text-sm text-gray-900">{booking.dropoffLocation}</p>
        </div>
      </div>

      {/* Accessibility Requirements */}
      {(profile.wheelchairAccess || profile.quietEnvironment || profile.femaleDriverOnly) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.wheelchairAccess && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">
              ♿ Wheelchair
            </span>
          )}
          {profile.quietEnvironment && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
              🔇 Quiet
            </span>
          )}
          {profile.assistanceRequired && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
              🤝 Assistance
            </span>
          )}
        </div>
      )}

      {/* Action Buttons (only for instant bookings) */}
      {isInstant && (
        <div className="flex gap-2 mt-4">
          {booking.status === "ACCEPTED" && (
            <button
              onClick={handleStart}
              disabled={updating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {updating ? "Starting..." : "Start Journey"}
            </button>
          )}
          {booking.status === "IN_PROGRESS" && (
            <button
              onClick={handleComplete}
              disabled={updating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {updating ? "Completing..." : "Complete Journey"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}