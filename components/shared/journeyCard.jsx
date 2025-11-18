"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import BidCard from "@/components/shared/bidCard"; 

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function JourneyCard({ booking }) {
  const [showBidForm, setShowBidForm] = useState(false);

  const handleBidSubmit = async (formData) => {
    // 🔧 You'll handle the actual bid submission here

    setShowBidForm(false);
  };

  return (
    <div
      className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
      role="article"
      aria-labelledby={`booking-${booking.id}-title`}
    >
      <div>
        <h3
          id={`booking-${booking.id}-title`}
          className="text-lg font-semibold text-blue-800"
        >
          {booking.pickupLocation} → {booking.dropoffLocation}
        </h3>

        <p className="text-sm text-gray-600">
          Pickup: {formatter.format(new Date(booking.pickupTime))}
        </p>

        {booking.returnTime && (
          <p className="text-sm text-gray-600">
            Return: {formatter.format(new Date(booking.returnTime))}
          </p>
        )}

        <p className="text-sm text-gray-700 mt-2">
          Passengers: {booking.passengerCount} | Wheelchair Users:{" "}
          {booking.wheelchairUsers}
        </p>

        {booking.additionalNeeds && (
          <p className="text-sm text-gray-600 mt-2">
            <strong>Needs:</strong> {booking.additionalNeeds}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {/* Instant Booking */}
        {booking.status === "PENDING" && booking.type === "INSTANT" && (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Accept
          </Button>
        )}

        {/* Advanced Booking */}
        {booking.type === "ADVANCED" && (
          <>
            {!showBidForm ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowBidForm(true)}
              >
                Place Bid
              </Button>
            ) : (
              <BidCard onSubmit={handleBidSubmit} />
            )}
          </>
        )}
      </div>
    </div>
  );
}