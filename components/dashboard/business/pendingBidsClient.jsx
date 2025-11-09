"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Phone,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";

export default function PendingBidsClient({ bookings, totalBids }) {
  const [status, setStatus] = useState("");
  const [acceptingBid, setAcceptingBid] = useState(null);
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

  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };

  const handleAcceptBid = async (bookingId, bidId) => {
    if (
      !confirm(
        "Accept this bid? The driver will be assigned and notified immediately."
      )
    ) {
      return;
    }

    setStatus("loading");
    setAcceptingBid(bidId);

    try {
      const res = await fetch("/api/bookings/[id]/accept-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, bidId }),
      });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to accept bid");
    }

    
    router.push("/dashboard/manager/bookings");
    router.refresh();
    
  } catch (error) {
    alert(`Error: ${error.message}`);
    setStatus("error");
  } finally {
    setAcceptingBid(null);
  }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/manager"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Bids</h1>
              <p className="text-gray-600 mt-1">
                Review and accept driver bids for your bookings
              </p>
            </div>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold">
            {totalBids} {totalBids === 1 ? "Bid" : "Bids"} Awaiting Review
          </div>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        {/* Bookings with Bids */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600 mb-6">
              No pending bids to review at the moment
            </p>
            <Link
              href="/dashboard/manager"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const lowestBid = booking.bids[0];
              const highestBid = booking.bids[booking.bids.length - 1];
              const averageBid =
                booking.bids.reduce((sum, bid) => sum + bid.amountCents, 0) /
                booking.bids.length;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* Booking Header */}
                  <div className="bg-yellow-50 border-b-2 border-yellow-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <h2 className="text-xl font-bold text-gray-900">
                            {booking.bids.length} New{" "}
                            {booking.bids.length === 1 ? "Bid" : "Bids"}
                          </h2>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDateTime(booking.pickupTime)}
                          </div>

                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-900">
                                {booking.pickupLocation} →{" "}
                                {booking.dropoffLocation}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-700">
                            <Users className="w-4 h-4 mr-2" />
                            {booking.passengerCount} passenger
                            {booking.passengerCount !== 1 ? "s" : ""}
                            {booking.wheelchairUsers > 0 &&
                              ` • ${booking.wheelchairUsers} wheelchair`}
                          </div>
                        </div>
                      </div>

                      {/* Bid Statistics */}
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2 text-green-700">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Lowest Bid:
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(lowestBid.amountCents)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(averageBid)} • High:{" "}
                          {formatCurrency(highestBid.amountCents)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/dashboard/manager/bookings/${booking.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Full Booking Details →
                      </Link>
                    </div>
                  </div>

                  {/* Bids List */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {booking.bids.map((bid, index) => (
                        <div
                          key={bid.id}
                          className={`p-4 rounded-lg border-2 ${
                            index === 0
                              ? "border-green-400 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Driver Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-gray-900">
                                  {bid.driver.name}
                                </h3>
                                {index === 0 && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                                    LOWEST BID
                                  </span>
                                )}
                              </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Car className="w-4 h-4 mr-2" />
                                  <span className="font-bold">{bid.driver.vehicleType}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {bid.driver.phone}
                                </div>
                               
                              </div>

                              {bid.message && (
                                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                  <p className="text-sm text-gray-700 italic">
                                    "{bid.message}"
                                  </p>
                                </div>
                              )}

                              <p className="text-xs text-gray-500 mt-2">
                                Bid placed {formatDateTime(bid.createdAt)}
                              </p>
                            </div>

                            {/* Price and Accept Button */}
                            <div className="text-right space-y-3">
                              <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                                <DollarSign className="w-4 h-4" />
                                <span>Bid Amount:</span>
                              </div>
                              <div className="text-3xl font-bold text-gray-900">
                                {formatCurrency(bid.amountCents)}
                              </div>
                              <Button
                                onClick={() =>
                                  handleAcceptBid(booking.id, bid.id)
                                }
                                disabled={
                                  status === "loading" && acceptingBid === bid.id
                                }
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                              >
                                {status === "loading" && acceptingBid === bid.id
                                  ? "Accepting..."
                                  : "Accept Bid"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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