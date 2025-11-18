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
  Zap,
  Accessibility,
  AlertCircle,
  Home,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";

export default function AvailableInstantBookingsClient({ bookings, driverId }) {
  const [status, setStatus] = useState("");
  const [accepting, setAccepting] = useState(null);
  const router = useRouter();

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUrgency = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const hoursUntil = (pickup - now) / (1000 * 60 * 60);

    if (hoursUntil < 1) return { level: "critical", text: "URGENT - Within 1 hour", color: "red" };
    if (hoursUntil < 3) return { level: "high", text: "High Priority - Within 3 hours", color: "orange" };
    if (hoursUntil < 12) return { level: "medium", text: "Moderate - Today", color: "yellow" };
    return { level: "normal", text: "Scheduled", color: "blue" };
  };

  const handleAcceptBooking = async (bookingId) => {
    if (!confirm("Accept this booking? You will be assigned as the driver.")) {
      return;
    }

    setStatus("loading");
    setAccepting(bookingId);

    try {
      const res = await fetch("/api/bookings/instant/${bookingId}/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Booking accepted! Check your schedule.");
        setTimeout(() => {
          router.push("/dashboard/driver/schedule");
        }, 1500);
      } else {
        setStatus("❌ " + (data.error || "Failed to accept booking"));
      }
    } catch (err) {
      console.error("Error accepting booking:", err);
      setStatus("❌ Something went wrong");
    } finally {
      setAccepting(null);
    }
  
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/driver"
            className="flex items-center text-blue-700 mr-4 hover:text-blue-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Available Instant Bookings
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              Quick accept immediate transport requests
            </p>
          </div>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              No instant bookings available right now
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const urgency = getUrgency(booking.pickupTime);
              const urgencyColors = {
                red: "bg-red-100 border-red-300 text-red-800",
                orange: "bg-orange-100 border-orange-300 text-orange-800",
                yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
                blue: "bg-blue-100 border-blue-300 text-blue-800",
              };

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    urgency.level === "critical" ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  {/* Urgency Banner */}
                  <div className={`${urgencyColors[urgency.color]} border-b px-4 py-2`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold text-sm">
                        {urgency.text}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Left - Booking Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {formatDateTime(booking.pickupTime)}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">
                              {booking.pickupLocation}
                            </p>
                            <p className="text-gray-400">↓</p>
                            <p className="text-gray-900 font-medium">
                              {booking.dropoffLocation}
                            </p>
                          </div>
                        </div>

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
                            </div>
                          )}
                        </div>

                        {/* Business/Passenger Info */}
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

                        {/* Special Requirements */}
                        {booking.accessibilityProfile && (
                          booking.accessibilityProfile.wheelchairAccess || 
                          booking.accessibilityProfile.carerPresent ||
                          booking.accessibilityProfile.quietEnvironment
                        ) && (
                          <div className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-blue-900 mb-1">
                                Special Requirements:
                              </p>
                              <ul className="text-blue-700 text-xs space-y-1">
                                {booking.accessibilityProfile.wheelchairAccess && (
                                  <li>• Wheelchair accessible vehicle required</li>
                                )}
                                {booking.accessibilityProfile.doubleWheelchairAccess && (
                                  <li>• Double wheelchair access needed</li>
                                )}
                                {booking.accessibilityProfile.carerPresent && (
                                  <li>• Carer accompanying passenger</li>
                                )}
                                {booking.accessibilityProfile.quietEnvironment && (
                                  <li>• Quiet environment preferred</li>
                                )}
                                {booking.accessibilityProfile.noConversation && (
                                  <li>• No conversation preferred</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right - Accept Button */}
                      <div className="text-right space-y-3 min-w-[180px]">
                        <Button
                          onClick={() => handleAcceptBooking(booking.id)}
                          disabled={status === "loading" && accepting === booking.id}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          size="lg"
                        >
                          {status === "loading" && accepting === booking.id ? (
                            "Accepting..."
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Accept Job
                            </>
                          )}
                        </Button>

                        <Link
                          href={`/dashboard/driver/bookings/${booking.id}`}
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          View Full Details →
                        </Link>
                       
                      </div>
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