"use client";

import { Button } from "@/components/ui/button";

export default function BookingCard({ booking, type }) {
  return (
    <div
      className="bg-white shadow rounded p-4 space-y-2 border"
      role="region"
      aria-labelledby={`booking-${booking.id}`}
    >
      <h3
        id={`booking-${booking.id}`}
        className="text-lg font-semibold text-blue-900"
      >
        {booking.pickupLocation} → {booking.dropoffLocation}
      </h3>
      <p className="text-sm text-gray-600">
        Pickup: {new Date(booking.pickupTime).toLocaleString()}
      </p>
      {booking.returnTime && (
        <p className="text-sm text-gray-600">
          Return: {new Date(booking.returnTime).toLocaleString()}
        </p>
      )}

      <p className="text-sm">
        Passengers: {booking.passengerCount} | Wheelchairs:{" "}
        {booking.wheelchairUsers}
      </p>

      {booking.additionalNeeds && (
        <p className="text-sm text-gray-700 italic">
          “{booking.additionalNeeds}”
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {type === "INSTANT" ? (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            aria-label="Accept instant booking"
          >
            Accept
          </Button>
        ) : (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Bid for advanced booking"
          >
            Place Bid
          </Button>
        )}

        {/* Show bid/acceptance status */}
        {type === "ADVANCED" && (
          <span
            className={`w-3 h-3 rounded-full ${
              booking.bids?.length > 0 ? "bg-green-500" : "bg-red-500"
            }`}
            aria-label={
              booking.bids?.length > 0
                ? "This booking has active bids"
                : "No bids yet"
            }
          />
        )}
      </div>
    </div>
  );
}