"use client";

export default function DriverJourneyCard({ booking }) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

      <div className="mt-4">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Assigned to you
        </span>
      </div>
    </div>
  );
}