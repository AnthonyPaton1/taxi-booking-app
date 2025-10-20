"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Phone,
  Home,
  Accessibility,
  AlertCircle,
  Navigation,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";

export default function DailyScheduleClient({
  instantBookings,
  advancedBookings,
  driverName,
}) {
  const [status, setStatus] = useState("");
  const [completing, setCompleting] = useState(null);
  const router = useRouter();

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const handleCompleteBooking = async (bookingId, type) => {
    if (!confirm("Mark this booking as complete?")) {
      return;
    }

    setStatus("loading");
    setCompleting(bookingId);

    try {
      const endpoint =
        type === "instant"
          ? "/api/bookings/instant/complete"
          : "/api/bookings/advanced/complete";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Booking marked as complete!");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setStatus("❌ " + (data.error || "Failed to complete booking"));
      }
    } catch (err) {
      console.error("Error completing booking:", err);
      setStatus("❌ Something went wrong");
    } finally {
      setCompleting(null);
    }
  };

  const openInMaps = (pickup, dropoff) => {
    const query = `${encodeURIComponent(pickup)} to ${encodeURIComponent(
      dropoff
    )}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank");
  };

  // Combine and sort all bookings by time
  const allBookings = [
    ...instantBookings.map((b) => ({ ...b, type: "instant" })),
    ...advancedBookings.map((b) => ({ ...b, type: "advanced" })),
  ].sort((a, b) => new Date(a.pickupTime) - new Date(b.pickupTime));

  const completedCount = allBookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const activeCount = allBookings.filter((b) => b.status === "ACCEPTED").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/driver"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Today's Schedule</h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </div>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        {/* Schedule */}
        {allBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings today
            </h3>
            <p className="text-gray-600 mb-6">
              Check available bookings to accept new jobs
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard/driver/instant"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
              >
                Instant Bookings
              </Link>
              <Link
                href="/dashboard/driver/advanced"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Advanced Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allBookings.map((booking) => {
              const isCompleted = booking.status === "COMPLETED";
              const isInstant = booking.type === "instant";

              return (
                <div
                  key={`${booking.type}-${booking.id}`}
                  className={`bg-white rounded-lg shadow-md p-6 ${
                    isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Left - Booking Details */}
                    <div className="flex-1 space-y-3">
                      {/* Time and Status */}
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-2xl font-bold text-gray-900">
                          {formatTime(booking.pickupTime)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isInstant
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isInstant ? "Instant" : "Advanced"}
                        </span>
                        {isCompleted && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Route */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 font-medium">
                              {booking.pickupLocation}
                            </p>
                            <button
                              onClick={() =>
                                openInMaps(
                                  booking.pickupLocation,
                                  booking.dropoffLocation
                                )
                              }
                              className="text-blue-600 hover:text-blue-700"
                              title="Open in Google Maps"
                            >
                              <Navigation className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-400">↓</p>
                          <p className="text-gray-900 font-medium">
                            {booking.dropoffLocation}
                          </p>
                        </div>
                      </div>

                      {/* Passenger Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.passengerCount} passenger
                          {booking.passengerCount !== 1 ? "s" : ""}
                        </div>
                        {booking.wheelchairUsers > 0 && (
                          <div className="flex items-center gap-1">
                            <Accessibility className="w-4 h-4" />
                            {booking.wheelchairUsers} wheelchair
                          </div>
                        )}
                        {booking.roundTrip && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Round trip
                            {booking.returnTime &&
                              ` - Return ${formatTime(booking.returnTime)}`}
                          </div>
                        )}
                      </div>

                      {/* Resident/House Info (for instant bookings) */}
                      {isInstant && (
                        <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded">
                          <Home className="w-4 h-4 text-gray-500" />
                          <div>
                            {booking.initials && booking.initials.length > 0 && (
                              <p className="font-medium text-gray-900">
                                Passenger(s): {booking.initials.join(", ")}
                              </p>
                            )}
                            {booking.business && (
                              <p className="text-gray-600 text-xs">
                                {booking.business.name}
                              </p>
                            )}
                            {booking.createdBy && (
                              <p className="text-gray-600 text-xs">
                                Booked by: {booking.createdBy.name}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Earnings (for advanced bookings) */}
                      {!isInstant && booking.acceptedBid && (
                        <div className="flex items-center gap-2 text-sm bg-green-50 p-3 rounded">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-900">
                            £{(booking.acceptedBid.amountCents / 100).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Special Requirements */}
                      {(booking.wheelchairAccess ||
                        booking.femaleDriverOnly ||
                        booking.additionalNeeds) && (
                        <div className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 mb-1">
                              Special Requirements:
                            </p>
                            <ul className="text-blue-700 text-xs space-y-1">
                              {booking.wheelchairAccess && (
                                <li>• Wheelchair accessible vehicle</li>
                              )}
                              {booking.femaleDriverOnly && (
                                <li>• Female driver requested</li>
                              )}
                              {booking.carerPresent && <li>• Carer present</li>}
                              {booking.additionalNeeds && (
                                <li>• {booking.additionalNeeds}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right - Actions */}
                    <div className="space-y-2 min-w-[180px] text-right">
                      {!isCompleted && (
                        <Button
                          onClick={() => handleCompleteBooking(booking.id, booking.type)}
                          disabled={status === "loading" && completing === booking.id}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {status === "loading" && completing === booking.id ? (
                            "Completing..."
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </>
                          )}
                        </Button>
                      )}

                      <Link
                        href={`/dashboard/driver/${booking.type}/${booking.id}`}
                        className="block text-sm text-blue-600 hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}