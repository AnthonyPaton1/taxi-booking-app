"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Accessibility,
} from "lucide-react";
import { toast } from "sonner";

export default function DriverBookingDetailsClient({
  booking,
  myBid,
  didWinBid,
  driverId,
}) {
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(cents / 100);
  };

  const formatDateTime = (date) => {
    if (!mounted) return "Loading..."; // ← Add this check
    return new Date(date).toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const amountCents = Math.round(parseFloat(bidAmount) * 100);

      if (isNaN(amountCents) || amountCents <= 0) {
        toast.error("Please enter a valid bid amount");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/bookings/${booking.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          message: bidMessage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Bid submitted successfully!");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to submit bid");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const canPlaceBid = !myBid && booking.status === "OPEN" && new Date(booking.bidDeadline) > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard/driver/my-bids">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Bids
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
        </div>

        {/* Status Banner */}
        {didWinBid && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Congratulations! You won this bid</p>
              <p className="text-sm text-green-700">Contact details are now available below</p>
            </div>
          </div>
        )}

        {myBid && !didWinBid && booking.status === "OPEN" && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Your bid is pending review</p>
              <p className="text-sm text-yellow-700">
                You bid {formatCurrency(myBid.amountCents)} • Manager will review soon
              </p>
            </div>
          </div>
        )}

        {myBid && !didWinBid && booking.acceptedBid && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Another driver was selected</p>
              <p className="text-sm text-red-700">
                Your bid: {formatCurrency(myBid.amountCents)} • Winning bid: {formatCurrency(booking.acceptedBid.amountCents)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Journey Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Pickup Time</p>
                    <p className="text-gray-700">{formatDateTime(booking.pickupTime)}</p>
                  </div>
                </div>

                {booking.returnTime && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Return Time</p>
                      <p className="text-gray-700">{formatDateTime(booking.returnTime)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Pickup</p>
                    <p className="text-gray-700">{booking.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Dropoff</p>
                    <p className="text-gray-700">{booking.dropoffLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Passengers</p>
                    <p className="text-gray-700">
                      {booking.passengerCount} {booking.passengerCount === 1 ? "person" : "people"}
                      {booking.initials && booking.initials.length > 0 && (
                        <span className="text-gray-500"> ({booking.initials.join(", ")})</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility Requirements */}
            {booking.accessibilityProfile && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Accessibility className="w-5 h-5" />
                  Accessibility Requirements
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {booking.accessibilityProfile.wheelchairAccess && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Wheelchair Access</span>
                    </div>
                  )}
                  {booking.accessibilityProfile.femaleDriverOnly && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Female Driver Required</span>
                    </div>
                  )}
                  {booking.accessibilityProfile.quietEnvironment && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Quiet Environment</span>
                    </div>
                  )}
                  {booking.accessibilityProfile.assistanceAnimal && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span>Assistance Animal</span>
                    </div>
                  )}
                </div>

                {booking.accessibilityProfile.additionalNeeds && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
                    <p className="text-sm text-gray-600">{booking.accessibilityProfile.additionalNeeds}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bid Form or Bid Status */}
            {canPlaceBid ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Place Your Bid</h2>
                
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bid Amount (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="25.00"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      rows={3}
                      placeholder="Why you're the best choice..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {submitting ? "Submitting..." : "Submit Bid"}
                  </button>
                </form>

                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Bid deadline: {formatDateTime(booking.bidDeadline)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {booking._count.bids} {booking._count.bids === 1 ? "bid" : "bids"} so far
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Bid</h2>
                {myBid && (
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(myBid.amountCents)}
                    </p>
                    {myBid.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">{myBid.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Contact Info (only if won) */}
            {didWinBid && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                
                <div className="space-y-3">
                  {booking.business && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Business
                      </p>
                      <p className="text-gray-900">{booking.business.name}</p>
                    </div>
                  )}

                  {booking.createdBy && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Manager
                        </p>
                        <p className="text-gray-900">{booking.createdBy.name}</p>
                      </div>

                      {booking.createdBy.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone
                          </p>
                          <a href={`tel:${booking.createdBy.phone}`} className="text-blue-600 hover:underline">
                            {booking.createdBy.phone}
                          </a>
                        </div>
                      )}

                      {booking.createdBy.email && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </p>
                          <a href={`mailto:${booking.createdBy.email}`} className="text-blue-600 hover:underline break-all">
                            {booking.createdBy.email}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Booking Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Info</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">{booking.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bids:</span>
                  <span className="font-medium text-gray-900">{booking._count.bids}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bid Deadline:</span>
                 <span className="font-medium text-gray-900">
  {mounted ? new Date(booking.bidDeadline).toLocaleDateString("en-GB") : "Loading..."} 
</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}