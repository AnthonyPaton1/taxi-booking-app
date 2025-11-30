// components/dashboard/business/singleBookingClient.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Phone,
  Mail,
  Car,
  AlertCircle,
  Edit,
} from "lucide-react";
import { formatDateTime } from "@/lib/dateUtils";

export default function SingleBookingClient({ booking }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [acceptingBid, setAcceptingBid] = useState(null);

 

  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };

  //  Handle accepting a bid
  const handleAcceptBid = async (bidId) => {
    if (!confirm("Accept this bid? The driver will be assigned to this booking.")) {
      return;
    }

    setAcceptingBid(bidId);
    setStatus("loading");

    try {
      const res = await fetch("/api/bookings/[id]/accept-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          bidId,
        }),
      });
      if (!res.ok) {
  const text = await res.text();
  console.error('Response status:', res.status);
  console.error('Response body:', text);
  throw new Error(`HTTP error! status: ${res.status}`);
}

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Bid accepted! Driver has been assigned.");
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus("❌ Failed to accept bid: " + data.error);
      }
    } catch (err) {
      console.error("Error accepting bid:", err);
      setStatus("❌ Something went wrong");
    } finally {
      setAcceptingBid(null);
    }
  };

  // ✅ Handle declining a bid
  const handleDeclineBid = async (bidId) => {
    if (!confirm("Decline this bid?")) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/bookings/decline-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Bid declined");
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus("❌ Failed to decline bid: " + data.error);
      }
    } catch (err) {
      console.error("Error declining bid:", err);
      setStatus("❌ Something went wrong");
    }
  };

  // ✅ Handle cancelling booking
  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Booking cancelled");
        setTimeout(() => {
          router.push("/dashboard/manager/bookings");
        }, 1500);
      } else {
        setStatus("❌ Failed to cancel: " + data.error);
      }
    } catch (err) {
      console.error("Error cancelling:", err);
      setStatus("❌ Something went wrong");
    }
  };

  // ✅ Get status badge
  const getStatusBadge = () => {
    switch (booking.status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            Awaiting Bids
          </span>
        );
      case "BID_ACCEPTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Bid Accepted
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <Car className="w-4 h-4 mr-2" />
            In Progress
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const canEdit = booking.status === "PENDING" && !booking.acceptedBidId;
  const canCancel = !["COMPLETED", "CANCELED"].includes(booking.status);
  const hasBids = booking.bids && booking.bids.length > 0;
  const pendingBids = booking.bids?.filter(bid => bid.status === "PENDING") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/manager/bookings"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Bookings
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {canEdit && (
              <Link
                href={`/dashboard/manager/bookings/${booking.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-lg ${
              status.startsWith("✅")
                ? "bg-green-50 text-green-800"
                : status === "loading"
                ? "bg-blue-50 text-blue-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {status === "loading" ? "Processing..." : status}
          </div>
        )}

        {/* Main Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Pickup Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDateTime(booking.pickupTime)}
              </p>
            </div>
          </div>

          {/* Return Time */}
          {booking.returnTime && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Return Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDateTime(booking.returnTime)}
                </p>
              </div>
            </div>
          )}

          {/* Locations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Pickup Location</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.pickupLocation}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Dropoff Location</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.dropoffLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Passengers</p>
              <p className="text-lg font-semibold text-gray-900">
                {booking.accessibilityProfile?.ambulatoryPassengers || 1} passenger
                {(booking.accessibilityProfile?.ambulatoryPassengers || 1) !== 1 ? "s" : ""}
                {booking.accessibilityProfile?.wheelchairUsersStaySeated > 0 &&
                  ` • ${booking.accessibilityProfile.wheelchairUsersStaySeated} wheelchair`}
              </p>
              {booking.initials && booking.initials.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Residents: {booking.initials.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Accessibility Requirements */}
          {booking.accessibilityProfile && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Accessibility Requirements
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {booking.accessibilityProfile.femaleDriverOnly && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Female driver only
                  </div>
                )}
                {booking.accessibilityProfile.carerPresent && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Carer present
                  </div>
                )}
                {booking.accessibilityProfile.assistanceRequired && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Assistance required
                  </div>
                )}
                {booking.accessibilityProfile.assistanceAnimal && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Assistance animal
                  </div>
                )}
              </div>
              {booking.accessibilityProfile.additionalNeeds && (
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-900">Additional Notes:</p>
                  <p className="text-sm text-blue-800 mt-1">
                    {booking.accessibilityProfile.additionalNeeds}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accepted Driver Card */}
        {(booking.status === "BID_ACCEPTED" || booking.status === "ACCEPTED" || booking.status === "IN_PROGRESS") &&
          booking.acceptedBid && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Assigned Driver
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-green-900">
                      {booking.acceptedBid.driver.user.name}
                    </p>
                    <p className="text-green-700">
                      {booking.acceptedBid.driver.vehicleClass}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-900">
                      {formatCurrency(booking.acceptedBid.amountCents)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {booking.acceptedBid.driver.user.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {booking.acceptedBid.driver.user.email}
                  </div>
                </div>
                {booking.acceptedBid.message && (
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-sm text-gray-700">{booking.acceptedBid.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Bids Section */}
        {booking.status === "PENDING" && hasBids && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Received Bids ({pendingBids.length})
            </h3>
            <div className="space-y-3">
              {pendingBids.map((bid) => (
                <div
                  key={bid.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-semibold text-gray-900">
                          {bid.driver.name}
                        </p>
                        <span className="text-sm text-gray-600">
                          {bid.driver.vehicleClass}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {bid.driver.phone}
                        </span>
                      </div>
                      {bid.message && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                          {bid.message}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-gray-900 mb-3">
                        {formatCurrency(bid.amountCents)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={acceptingBid === bid.id || status === "loading"}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {acceptingBid === bid.id ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          onClick={() => handleDeclineBid(bid.id)}
                          disabled={status === "loading"}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:bg-gray-400"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Bids Yet */}
        {booking.status === "PENDING" && !hasBids && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              No bids received yet
            </h3>
            <p className="text-yellow-800">
              Drivers will be notified about this booking. Check back soon for bids.
            </p>
          </div>
        )}

        {/* Cancel Section */}
        {canCancel && !cancelling && (
          <button
            onClick={() => setCancelling(true)}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
          >
            Cancel Booking
          </button>
        )}

        {cancelling && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Booking
            </h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelBooking}
                disabled={status === "loading"}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-400"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => {
                  setCancelling(false);
                  setCancelReason("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Keep Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}