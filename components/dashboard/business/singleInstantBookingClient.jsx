// components/dashboard/business/singleInstantBookingClient.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Accessibility,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
} from "lucide-react";

export default function SingleInstantBookingClient({ booking }) {
  const [status, setStatus] = useState("");
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

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, text: "Awaiting Driver" },
      ACCEPTED: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Driver Assigned" },
      COMPLETED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, text: "Completed" },
      CANCELED: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Cancelled" },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const handleCancelBooking = async () => {
    if (!confirm("Cancel this booking? This cannot be undone.")) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`/api/bookings/instant/${booking.id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Booking cancelled.");
        setTimeout(() => {
          router.push("/dashboard/manager/bookings?type=instant");
        }, 1500);
      } else {
        setStatus("❌ Failed to cancel: " + data.error);
      }
    } catch (err) {
      console.error("Error cancelling:", err);
      setStatus("❌ Something went wrong.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/manager/bookings?type=instant"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Bookings
        </Link>
      </div>

      <StatusMessage message={status} type={status?.startsWith("❌") ? "error" : "info"} />

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Instant Booking</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Created {formatDateTime(booking.createdAt)} by {booking.createdBy}
          </p>
        </div>
        <div>
          {getStatusBadge(booking.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Journey Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-24 text-gray-600 font-medium">Pickup:</div>
                <div className="flex-1">
                  <p className="text-gray-900">{booking.pickupLocation}</p>
                  <p className="text-sm text-gray-500">{booking.pickupPostcode}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-24 text-gray-600 font-medium">Dropoff:</div>
                <div className="flex-1">
                  <p className="text-gray-900">{booking.dropoffLocation}</p>
                  <p className="text-sm text-gray-500">{booking.dropoffPostcode}</p>
                </div>
              </div>

              <div className="flex items-center pt-3 border-t">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-gray-900 font-medium">
                  {formatDateTime(booking.pickupTime)}
                </span>
              </div>

              {booking.roundTrip && booking.returnTime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-900">
                    Return: {new Date(booking.returnTime).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Resident Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Resident Information
            </h2>

            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {booking.resident.name}</p>
              <p><span className="font-medium">House:</span> {booking.resident.house.label}</p>
              <p className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-600" />
                {booking.passengerCount} passenger{booking.passengerCount > 1 ? "s" : ""}
              </p>
              {booking.wheelchairUsers > 0 && (
                <p className="flex items-center">
                  <Accessibility className="w-4 h-4 mr-2 text-gray-600" />
                  {booking.wheelchairUsers} wheelchair user{booking.wheelchairUsers > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Special Requirements */}
          {(booking.additionalNeeds || booking.wheelchairAccess || booking.femaleDriverOnly) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Special Requirements</h2>
              
              <div className="space-y-2">
                {booking.wheelchairAccess && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Wheelchair Access Required
                  </p>
                )}
                {booking.femaleDriverOnly && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Female Driver Only
                  </p>
                )}
                {booking.carerPresent && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Carer Present
                  </p>
                )}
                {booking.assistanceAnimal && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Assistance Animal
                  </p>
                )}
                {booking.additionalNeeds && (
                  <div className="pt-2 border-t">
                    <p className="font-medium text-gray-700">Additional Notes:</p>
                    <p className="text-gray-600 mt-1">{booking.additionalNeeds}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manager Notes (Internal) */}
          {booking.managerNotes && (
            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-yellow-600" />
                Internal Manager Notes
              </h2>
              <p className="text-gray-700">{booking.managerNotes}</p>
              <p className="text-sm text-gray-500 mt-2">🔒 Not visible to drivers</p>
            </div>
          )}
        </div>

        {/* Right Column - Driver Status */}
        <div className="space-y-6">
          {/* Driver Assignment Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-600" />
              Driver Status
            </h2>

            {booking.status === "ACCEPTED" && booking.assignedDriver ? (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-bold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Driver Assigned
                </p>
                <div className="space-y-2">
                  <p className="font-medium">{booking.assignedDriver.user.name}</p>
                  <p className="text-sm flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2" />
                    {booking.assignedDriver.user.phone}
                  </p>
                  <p className="text-sm flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-2" />
                    {booking.assignedDriver.user.email}
                  </p>
                </div>
              </div>
            ) : booking.status === "COMPLETED" ? (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 text-center">
                <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-blue-800">Journey Completed</p>
              </div>
            ) : booking.status === "CANCELED" ? (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200 text-center">
                <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                <p className="font-bold text-red-800">Booking Cancelled</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 text-purple-400 animate-pulse" />
                <p>Awaiting driver acceptance</p>
                <p className="text-sm mt-1">Drivers have been notified</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {booking.status === "PENDING" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-3">Actions</h3>
              <Button
                onClick={handleCancelBooking}
                disabled={status === "loading"}
                variant="destructive"
                className="w-full"
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}