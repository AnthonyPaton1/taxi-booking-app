// components/dashboard/public/publicBookingDetailClient.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Accessibility,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  PoundSterling,
  AlertCircle,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";
import { formatDateTime } from "@/lib/dateUtils";

export default function PublicBookingDetailClient({ booking }) {
  const [status, setStatus] = useState("");
  const [selectedBidId, setSelectedBidId] = useState(null);
  const router = useRouter();



  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };

  const handleAcceptBid = async (bidId) => {
    if (
      !confirm(
        "Accept this driver's offer? They will be notified and assigned to your journey."
      )
    ) {
      return;
    }

    setStatus("loading");
    setSelectedBidId(bidId);

    try {
      const res = await fetch("/api/bookings/accept-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, bidId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Driver confirmed! They will contact you soon.");
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus("❌ " + (data.error || "Failed to accept bid"));
      }
    } catch (err) {
      console.error("Error accepting bid:", err);
      setStatus("❌ Something went wrong");
    } finally {
      setSelectedBidId(null);
    }
  };

  const handleDeclineBid = async (bidId, driverName) => {
    if (
      !confirm(
        `Decline ${driverName}'s offer? They will be notified and removed from this booking.`
      )
    ) {
      return;
    }

    setStatus("loading");
    setSelectedBidId(bidId);

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
        }, 1000);
      } else {
        setStatus("❌ " + (data.error || "Failed to decline bid"));
      }
    } catch (err) {
      console.error("Error declining bid:", err);
      setStatus("❌ Something went wrong");
    } finally {
      setSelectedBidId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (
      !confirm(
        "Cancel this booking? This cannot be undone and all bids will be rejected."
      )
    ) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Booking cancelled");
        setTimeout(() => {
          router.push("/dashboard/public");
        }, 1500);
      } else {
        setStatus("❌ " + (data.error || "Failed to cancel"));
      }
    } catch (err) {
      console.error("Error cancelling:", err);
      setStatus("❌ Something went wrong");
    }
  };

  const activeBids = booking.bids?.filter((bid) => bid.status === "PENDING") || [];
  const lowestBid = activeBids.length > 0 ? activeBids[0] : null;
  const averageBid =
    activeBids.length > 0
      ? activeBids.reduce((sum, bid) => sum + bid.amountCents, 0) /
        activeBids.length
      : 0;

  const isAccepted = booking.status === "ACCEPTED";
  const isPast = new Date(booking.pickupTime) < new Date();

  return (
    <>
      {/* Skip to main content */}
      
      <a  href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <StatusMessage
            message={status}
            type={status?.startsWith("❌") ? "error" : "info"}
          />

          {/* Header */}
          <header className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/public"
                className="flex items-center text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              >
                <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Your Booking
                </h1>
                <p className="text-gray-600 mt-1">
                  Created {formatDateTime(booking.createdAt)}
                </p>
              </div>
              <StatusBadge booking={booking} />
            </div>
          </header>

          <main id="main-content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Journey Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Journey Info */}
                <section
                  aria-labelledby="journey-heading"
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h2
                    id="journey-heading"
                    className="text-xl font-bold text-gray-900 mb-4 flex items-center"
                  >
                    <MapPin
                      className="w-5 h-5 mr-2 text-blue-600"
                      aria-hidden="true"
                    />
                    Journey Details
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-24 text-gray-600 font-medium">From:</div>
                      <div className="flex-1">
                        <p className="text-gray-900">{booking.pickupLocation}</p>
                        {booking.accessibilityProfile?.pickupPostcode && (
                          <p className="text-sm text-gray-500">
                            {booking.accessibilityProfile.pickupPostcode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-24 text-gray-600 font-medium">To:</div>
                      <div className="flex-1">
                        <p className="text-gray-900">{booking.dropoffLocation}</p>
                        {booking.accessibilityProfile?.dropoffPostcode && (
                          <p className="text-sm text-gray-500">
                            {booking.accessibilityProfile.dropoffPostcode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center pt-3 border-t">
                      <Calendar
                        className="w-5 h-5 mr-2 text-gray-600"
                        aria-hidden="true"
                      />
                      <time
                        dateTime={booking.pickupTime}
                        className="text-gray-900 font-medium"
                      >
                        {formatDateTime(booking.pickupTime)}
                      </time>
                    </div>

                    {booking.returnTime && (
                      <div className="flex items-center">
                        <Clock
                          className="w-5 h-5 mr-2 text-gray-600"
                          aria-hidden="true"
                        />
                        <span className="text-gray-900">
                          Return:{" "}
                          {new Date(booking.returnTime).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center pt-3 border-t">
                      <Users
                        className="w-5 h-5 mr-2 text-gray-600"
                        aria-hidden="true"
                      />
                      <span className="text-gray-900">
                        {booking.accessibilityProfile?.passengerCount || 0} passenger
                        {booking.accessibilityProfile?.passengerCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {booking.accessibilityProfile?.wheelchairUsers > 0 && (
                      <div className="flex items-center">
                        <Accessibility
                          className="w-5 h-5 mr-2 text-gray-600"
                          aria-hidden="true"
                        />
                        <span className="text-gray-900">
                          {booking.accessibilityProfile.wheelchairUsers} wheelchair
                          user
                          {booking.accessibilityProfile.wheelchairUsers !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Accessibility Requirements */}
                {booking.accessibilityProfile && (
                  <AccessibilitySection profile={booking.accessibilityProfile} />
                )}
              </div>

              {/* Right Column - Bids */}
              <aside className="space-y-6">
                {/* Bid Statistics */}
                {activeBids.length > 0 && !isAccepted && (
                  <section
                    aria-labelledby="stats-heading"
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <h2 id="stats-heading" className="text-lg font-bold text-gray-900 mb-4">
                      Bid Summary
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Offers:</span>
                        <span className="font-bold text-lg">{activeBids.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Lowest Offer:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(lowestBid.amountCents)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(averageBid)}
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Driver Bids */}
                <section
                  aria-labelledby="bids-heading"
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h2
                    id="bids-heading"
                    className="text-xl font-bold text-gray-900 mb-4 flex items-center"
                  >
                    <Car className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                    Driver Offers ({activeBids.length})
                  </h2>

                  {isAccepted && booking.acceptedBid ? (
                    <ConfirmedDriver bid={booking.acceptedBid} />
                  ) : activeBids.length === 0 ? (
                    <EmptyBids />
                  ) : (
                    <BidsList
                      bids={activeBids}
                      onAccept={handleAcceptBid}
                      onDecline={handleDeclineBid}
                      isLoading={status === "loading"}
                      selectedBidId={selectedBidId}
                    />
                  )}
                </section>

                {/* Actions */}
                {!isAccepted && !isPast && (
                  <section className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-bold text-gray-900 mb-3">Actions</h3>
                    <Button
                      onClick={handleCancelBooking}
                      disabled={status === "loading"}
                      variant="destructive"
                      className="w-full"
                    >
                      Cancel Booking
                    </Button>
                  </section>
                )}
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// Sub-components

const StatusBadge = ({ booking }) => {
  if (booking.status === "ACCEPTED") {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
        role="status"
        aria-label="Booking confirmed with driver"
      >
        <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
        Driver Confirmed
      </span>
    );
  }

  if (booking.status === "OPEN") {
    const hasBids = booking.bids && booking.bids.length > 0;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          hasBids
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}
        role="status"
        aria-label={hasBids ? "Bids received" : "Awaiting bids"}
      >
        {hasBids ? (
          <>
            <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
            {booking.bids.length} Offer{booking.bids.length !== 1 ? "s" : ""}
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
            Awaiting Offers
          </>
        )}
      </span>
    );
  }

  return null;
};

const AccessibilitySection = ({ profile }) => {
  const requirements = [];

  if (profile.wheelchairAccess) requirements.push("Wheelchair Access");
  if (profile.carerPresent) requirements.push("Carer Present");
  if (profile.assistanceRequired) requirements.push("Assistance Required");
  if (profile.assistanceAnimal) requirements.push("Assistance Animal");
  if (profile.femaleDriverOnly) requirements.push("Female Driver Only");
  if (profile.quietEnvironment) requirements.push("Quiet Environment");
  if (profile.noConversation) requirements.push("No Conversation");

  if (requirements.length === 0 && !profile.additionalNeeds) {
    return null;
  }

  return (
    <section
      aria-labelledby="accessibility-heading"
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2
        id="accessibility-heading"
        className="text-xl font-bold text-gray-900 mb-4"
      >
        Special Requirements
      </h2>

      {requirements.length > 0 && (
        <ul className="space-y-2 mb-4" role="list">
          {requirements.map((req) => (
            <li key={req} className="flex items-center text-gray-700">
              <CheckCircle
                className="w-4 h-4 mr-2 text-green-600"
                aria-hidden="true"
              />
              {req}
            </li>
          ))}
        </ul>
      )}

      {profile.additionalNeeds && (
        <div className="pt-4 border-t">
          <p className="font-medium text-gray-700 mb-1">Additional Notes:</p>
          <p className="text-gray-600">{profile.additionalNeeds}</p>
        </div>
      )}
    </section>
  );
};

const ConfirmedDriver = ({ bid }) => (
    <>
    
  <div
    className="bg-green-50 p-4 rounded-lg border-2 border-green-200"
    role="status"
    aria-label="Driver confirmed"
  >
    <p className="font-bold text-green-800 mb-3 flex items-center">
      <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
      Your Driver
    </p>
    <div className="space-y-2">
      <p className="font-medium text-lg">{bid.driver.user.name}</p>
      <p className="text-sm text-gray-700">{bid.driver.vehicleType}</p>
      <div className="space-y-1 pt-2 border-t">
        <p className="text-sm flex items-center text-gray-700">
          <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
          
           <a href={`tel:${bid.driver.user.phone}`}
            className="underline hover:no-underline focus:ring-2 focus:ring-green-500 rounded"
          >
            {bid.driver.user.phone}
          </a>
        </p>
        <p className="text-sm flex items-center text-gray-700">
          <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
          
           <a href={`mailto:${bid.driver.user.email}`}
            className="underline hover:no-underline focus:ring-2 focus:ring-green-500 rounded"
          >
            {bid.driver.user.email}
          </a>
        </p>
      </div>
      <p className="text-lg font-bold text-green-700 mt-3">
        {new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: "GBP",
        }).format(bid.amountCents / 100)}
      </p>
    </div>
  </div>
  </>
);

const EmptyBids = () => (
  <div className="text-center py-8 text-gray-500" role="status">
    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" aria-hidden="true" />
    <p className="font-medium">No offers yet</p>
    <p className="text-sm mt-1">Drivers will be notified shortly</p>
  </div>
);

const BidsList = ({ bids, onAccept, onDecline, isLoading, selectedBidId }) => {
  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };

  return (
    <ul className="space-y-3" role="list">
      {bids.map((bid, index) => (
        <li
          key={bid.id}
          className={`p-4 rounded-lg border-2 ${
            index === 0
              ? "border-green-400 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-gray-900">{bid.driver.user.name}</p>
              <p className="text-sm text-gray-600">{bid.driver.vehicleType}</p>
            </div>
            {index === 0 && (
              <span
                className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                role="status"
              >
                Lowest
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(bid.amountCents)}
            </span>

            <div className="flex gap-2">
              <Button
                onClick={() => onAccept(bid.id)}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                aria-label={`Accept offer from ${bid.driver.user.name}`}
              >
                {isLoading && selectedBidId === bid.id
                  ? "Accepting..."
                  : "Accept"}
              </Button>
              <Button
                onClick={() => onDecline(bid.id, bid.driver.user.name)}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1"
                aria-label={`Decline offer from ${bid.driver.user.name}`}
              >
                Decline
              </Button>
            </div>
          </div>

          {bid.message && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-sm text-gray-600 italic">&quot;{bid.message}&quot;</p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Offered {new Date(bid.createdAt).toLocaleString("en-GB")}
          </p>
        </li>
      ))}
    </ul>
  );
};