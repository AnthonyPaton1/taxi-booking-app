//components/dashboard/driver/AvailableAdvancedBookingsClient.jsx
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
  DollarSign,
  TrendingUp,
  Accessibility,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";

export default function AvailableAdvancedBookingsClient({ bookings, driverId }) {
  const [status, setStatus] = useState("");
  const [biddingOn, setBiddingOn] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
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

  const handlePlaceBid = async (bookingId) => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setStatus("❌ Please enter a valid bid amount");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/bids/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advancedBookingId: bookingId,
          amountCents: Math.round(parseFloat(bidAmount) * 100),
          message: bidMessage.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Bid placed successfully!");
        setBiddingOn(null);
        setBidAmount("");
        setBidMessage("");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setStatus("❌ " + (data.error || "Failed to place bid"));
      }
    } catch (err) {
      console.error("Error placing bid:", err);
      setStatus("❌ Something went wrong");
    }
  };

  const openBidModal = (bookingId) => {
    setBiddingOn(bookingId);
    setBidAmount("");
    setBidMessage("");
    setStatus("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/driver"
            className="flex items-center text-blue-600 mr-4 hover:text-blue-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Available Advanced Bookings
            </h1>
            <p className="text-gray-600 mt-1">
              Place bids on upcoming rides
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
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings available
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const myBid = booking.bids[0]; // Driver's existing bid
              const hasBid = !!myBid;
              const totalBids = booking._count.bids;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between">
                    {/* Left - Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {formatDateTime(booking.pickupTime)}
                        </span>
                        {totalBids > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {totalBids} {totalBids === 1 ? "bid" : "bids"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium">
                            {booking.pickupLocation}
                          </p>
                          <p className="text-gray-600">↓</p>
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

                      {booking.accessibilityProfile && (
                        <div className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">
                              Special Requirements
                            </p>
                            <p className="text-blue-700 text-xs mt-1">
                              View full details to see accessibility needs
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right - Bidding Section */}
                    <div className="text-right space-y-3 min-w-[200px]">
                      {hasBid ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-700 mb-2">
                            Your Bid
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            £{(myBid.amountCents / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            Submitted {formatDateTime(myBid.createdAt)}
                          </p>
                        </div>
                      ) : biddingOn === booking.id ? (
                        <div className="space-y-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="£0.00"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                          <textarea
                            placeholder="Optional message..."
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePlaceBid(booking.id)}
                              disabled={status === "loading"}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              Submit
                            </Button>
                            <Button
                              onClick={() => setBiddingOn(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => openBidModal(booking.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Place Bid
                        </Button>
                      )}

                      <Link
                        href={`/dashboard/driver/advanced/${booking.id}`}
                        className="block text-sm text-blue-600 hover:underline"
                      >
                        View Full Details →
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