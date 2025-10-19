// components/shared/InstantBookingCard.jsx
"use client";

import { useState } from "react";
import { acceptInstantBooking } from "@/app/actions/bookings/bidActions";
import { useRouter } from "next/navigation";

export default function InstantBookingCard({ booking }) {
  const [accepting, setAccepting] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!confirm("Accept this booking?")) return;

    setAccepting(true);
    const result = await acceptInstantBooking(booking.id);

    if (result.success) {
      alert("✅ Booking accepted!");
      router.refresh();
    } else {
      alert(`❌ ${result.error}`);
      setAccepting(false);
    }
  };

  const pickupTime = new Date(booking.pickupTime);
  const profile = booking.accessibilityProfile;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Time Badge */}
      <div className="flex justify-between items-start mb-3">
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
          {pickupTime.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="text-xs text-gray-500">
          {pickupTime.toLocaleDateString("en-GB")}
        </span>
      </div>

      {/* Locations */}
      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs text-gray-500">Pickup</p>
          <p className="text-sm font-medium text-gray-900">{booking.pickupLocation}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Dropoff</p>
          <p className="text-sm font-medium text-gray-900">{booking.dropoffLocation}</p>
        </div>
      </div>

      {/* Accessibility Badges */}
      <div className="flex flex-wrap gap-1 mb-4">
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
        {profile.femaleDriverOnly && (
          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded">
            👩 Female driver
          </span>
        )}
        {profile.passengerCount > 0 && (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
            👥 {profile.passengerCount} pax
          </span>
        )}
      </div>

      {/* Accept Button */}
      <button
        onClick={handleAccept}
        disabled={accepting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {accepting ? "Accepting..." : "Accept Booking"}
      </button>
    </div>
  );
}