// components/shared/AdvancedBookingCard.jsx
"use client";

import { useState } from "react";
import { createBid } from "@/app/actions/bookings/bidActions";
import { useRouter } from "next/navigation";

export default function AdvancedBookingCard({ booking, showBidButton = true }) {
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const pickupTime = new Date(booking.pickupTime);
  const profile = booking.accessibilityProfile;
  const alreadyBid = booking.bids && booking.bids.length > 0;

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    
    const amountPounds = parseFloat(bidAmount);
    if (isNaN(amountPounds) || amountPounds <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    setSubmitting(true);
    
    const result = await createBid({
      advancedBookingId: booking.id,
      amountCents: Math.round(amountPounds * 100),
      message: message || null,
    });

    if (result.success) {
      alert("✅ Bid submitted successfully!");
      setShowBidForm(false);
      setBidAmount("");
      setMessage("");
      router.refresh();
    } else {
      alert(`❌ ${result.error}`);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded">
            {pickupTime.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {booking._count && (
            <span className="ml-2 text-xs text-gray-500">
              {booking._count.bids} bid{booking._count.bids !== 1 ? "s" : ""}
            </span>
          )}
        </div>
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

      {/* Accessibility */}
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

      {/* Bid Deadline */}
      {booking.bidDeadline && (
        <p className="text-xs text-gray-500 mb-3">
          Bid deadline: {new Date(booking.bidDeadline).toLocaleString("en-GB")}
        </p>
      )}

      {/* Already Bid Notice */}
      {alreadyBid && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
          <p className="text-xs text-blue-800">
            ✓ You've already placed a bid: £{(booking.bids[0].amountCents / 100).toFixed(2)}
          </p>
        </div>
      )}

      {/* Bid Form or Button */}
      {showBidButton && !alreadyBid && (
        <>
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Place Bid
            </button>
          ) : (
            <form onSubmit={handleSubmitBid} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bid Amount (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="25.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any additional details..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 text-sm"
                >
                  {submitting ? "Submitting..." : "Submit Bid"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}