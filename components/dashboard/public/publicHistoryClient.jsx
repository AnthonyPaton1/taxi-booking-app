// components/dashboard/public/publicHistoryClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function PublicHistoryClient({
  user,
  upcomingBookings,
  pastBookings,
}) {
  const [filter, setFilter] = useState("all"); // all, upcoming, past

  const displayBookings =
    filter === "upcoming"
      ? upcomingBookings
      : filter === "past"
      ? pastBookings
      : [...upcomingBookings, ...pastBookings];

  return (
    <>
      
       <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Header */}
          <header className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/public"
                className="flex items-center text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              >
                <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
                Back to Dashboard
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Booking History
            </h1>
            <p className="text-gray-600 mt-1">
              View all your transport bookings
            </p>
          </header>

          {/* Filter Tabs */}
          <section aria-labelledby="filter-heading">
            <h2 id="filter-heading" className="sr-only">
              Filter bookings
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-2">
              <div className="flex gap-2" role="tablist">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  role="tab"
                  aria-selected={filter === "all"}
                  aria-controls="bookings-panel"
                >
                  All Bookings
                  <span className="ml-2 text-sm">
                    ({upcomingBookings.length + pastBookings.length})
                  </span>
                </button>
                <button
                  onClick={() => setFilter("upcoming")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "upcoming"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  role="tab"
                  aria-selected={filter === "upcoming"}
                  aria-controls="bookings-panel"
                >
                  Upcoming
                  <span className="ml-2 text-sm">
                    ({upcomingBookings.length})
                  </span>
                </button>
                <button
                  onClick={() => setFilter("past")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "past"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  role="tab"
                  aria-selected={filter === "past"}
                  aria-controls="bookings-panel"
                >
                  Past
                  <span className="ml-2 text-sm">({pastBookings.length})</span>
                </button>
              </div>
            </div>
          </section>

          {/* Bookings List */}
          <main id="main-content">
            <section
              id="bookings-panel"
              role="tabpanel"
              aria-labelledby="filter-heading"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {displayBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <p className="text-gray-600 text-lg mb-2">
                    No {filter} bookings
                  </p>
                  <Link
                    href="/book-ride"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mt-4"
                  >
                    Book New Journey
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4" role="list">
                  {displayBookings.map((booking) => (
                    <HistoryBookingCard key={booking.id} booking={booking} />
                  ))}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

const HistoryBookingCard = ({ booking }) => {
  const pickupTime = new Date(booking.pickupTime);
  const isPast = pickupTime < new Date();
  const hasBids = booking.bids && booking.bids.length > 0;
  const isAccepted = booking.status === "ACCEPTED";

  const dateString = pickupTime.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeString = pickupTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={`/dashboard/public/bookings/${booking.id}`}
        className="block border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg p-5 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500"
        aria-label={`Booking from ${booking.pickupLocation} to ${booking.dropoffLocation} on ${dateString} at ${timeString}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Date */}
            <div className="flex items-center gap-3 flex-wrap">
              <time
                dateTime={booking.pickupTime}
                className="text-sm font-semibold text-gray-900"
              >
                <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
                {dateString} at {timeString}
              </time>
              <StatusBadge booking={booking} hasBids={hasBids} />
            </div>

            {/* Route */}
            <div className="flex items-start gap-2">
              <MapPin
                className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="text-sm">
                <p className="text-gray-900">
                  <span className="font-medium">From:</span>{" "}
                  {booking.pickupLocation}
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">To:</span>{" "}
                  {booking.dropoffLocation}
                </p>
              </div>
            </div>

            {/* Driver info if accepted */}
            {isAccepted && booking.acceptedBid && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                <p className="font-medium text-green-900">
                  <CheckCircle
                    className="w-3 h-3 inline mr-1"
                    aria-hidden="true"
                  />
                  Driver: {booking.acceptedBid.driver.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};

const StatusBadge = ({ booking, hasBids }) => {
  if (booking.status === "COMPLETED") {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        role="status"
      >
        <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
        Completed
      </span>
    );
  }

  if (booking.status === "CANCELED") {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
        role="status"
      >
        <XCircle className="w-3 h-3 mr-1" aria-hidden="true" />
        Cancelled
      </span>
    );
  }

  if (booking.status === "ACCEPTED") {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        role="status"
      >
        <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
        Confirmed
      </span>
    );
  }

  if (hasBids) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
        role="status"
      >
        <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
        {booking.bids.length} Offer{booking.bids.length !== 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
      role="status"
    >
      <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
      Open
    </span>
  );
};