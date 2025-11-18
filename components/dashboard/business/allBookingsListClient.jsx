"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  ArrowLeft,
  Zap,
  Timer,
} from "lucide-react";

export default function AllBookingsListClient({
  bookings,
  counts,
  currentFilter,
  currentSearch,
  bookingType,
  currentPage,
  totalPages
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (currentFilter !== "all") params.set("filter", currentFilter);
    params.set("type", bookingType);
    router.push(`/dashboard/manager/bookings?${params.toString()}`);
  };

  const handleFilterChange = (filter) => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (searchTerm) params.set("search", searchTerm);
    params.set("type", bookingType);
    router.push(`/dashboard/manager/bookings?${params.toString()}`);
  };

  const handleTypeChange = (type) => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (currentFilter !== "all") params.set("filter", currentFilter);
    if (searchTerm) params.set("search", searchTerm);
    router.push(`/dashboard/manager/bookings?${params.toString()}`);
  };

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

  const formatCurrency = (amount) => {
    // Handle both cents (advanced) and regular amounts (instant)
    const value = amount > 1000 ? amount / 100 : amount;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);
  };

  const getStatusBadge = (booking) => {
    if (bookingType === "advanced") {
      const hasBids = booking.bids && booking.bids.length > 0;

      if (booking.status === "ACCEPTED") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      }

      if (booking.status === "COMPLETED") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      }

      if (booking.status === "CANCELED") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      }

      if (hasBids) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {booking.bids.length} Bid{booking.bids.length !== 1 ? "s" : ""}
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Awaiting Bids
        </span>
      );
    } else {
      // Instant booking statuses
      if (booking.status === "ACCEPTED") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Assigned
          </span>
        );
      }

      if (booking.status === "COMPLETED") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      }

      if (booking.status === "CANCELED") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Zap className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const filters =
    bookingType === "advanced"
      ? [
          { key: "all", label: "All", count: counts.all },
          { key: "upcoming", label: "Upcoming", count: counts.upcoming },
          { key: "pending", label: "Needs Review", count: counts.pending },
          { key: "awaiting", label: "Awaiting Bids", count: counts.awaiting },
          { key: "confirmed", label: "Confirmed", count: counts.confirmed },
          {key: "canceled", label: "Cancelled", count: counts.canceled},
          {key: "completed", label: "Completed", count: counts.completed}
        ]
      : [
          { key: "all", label: "All", count: counts.all },
          { key: "upcoming", label: "Upcoming", count: counts.upcoming },
          { key: "confirmed", label: "Assigned", count: counts.confirmed },
        ];

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
              Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/manager/book-ride"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Timer className="w-4 h-4" />
              Pre-Schedule
            </Link>
            <Link
              href="/dashboard/manager/instant-booking"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Instant Book
            </Link>
          </div>
        </div>

        {/* Booking Type Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange("advanced")}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                bookingType === "advanced"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Timer className="w-5 h-5" />
              Pre-Scheduled Bookings
            </button>
            <button
              onClick={() => handleTypeChange("instant")}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                bookingType === "instant"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Zap className="w-5 h-5" />
              Instant Bookings
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Resident Initials or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  handleTypeChange(bookingType);
                }}
                className="text-gray-600 hover:text-gray-900 px-4"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  currentFilter === filter.key
                    ? bookingType === "advanced"
                      ? "bg-blue-600 text-white"
                      : "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    currentFilter === filter.key
                      ? bookingType === "advanced"
                        ? "bg-blue-700"
                        : "bg-purple-700"
                      : "bg-gray-200"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No bookings found</p>
              <p className="text-gray-500 text-sm mb-6">
                {searchTerm
                  ? "Try adjusting your search"
                  : `Create your first ${
                      bookingType === "advanced" ? "pre-scheduled" : "instant"
                    } booking`}
              </p>
              <Link
                href={
                  bookingType === "advanced"
                    ? "/dashboard/manager/book-ride"
                    : "/dashboard/manager/instant-booking"
                }
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Booking
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const lowestBid =
                  bookingType === "advanced" ? booking.bids[0] : null;
                const isPast = new Date(booking.pickupTime) < new Date();
                const linkHref =
                  bookingType === "advanced"
                   ? `/dashboard/manager/bookings/${booking.id}`
                    : `/dashboard/manager/bookings/${booking.id}?type=instant`;

                return (
                  <Link
                    key={booking.id}
                    href={linkHref}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Side - Details */}
                      <div className="flex-1 space-y-3">
                        {/* Date and Status */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-gray-900 font-semibold">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {formatDateTime(booking.pickupTime)}
                          </div>
                          {getStatusBadge(booking)}
                          {isPast && booking.status === "OPEN" && (
                            <span className="text-xs text-red-600 font-medium">
                              (Past)
                            </span>
                          )}
                        </div>

                        {/* Locations */}
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
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

                        {/* Passenger Count */}
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {booking.passengerCount} passenger
                          {booking.passengerCount !== 1 ? "s" : ""}
                          {booking.wheelchairUsers > 0 &&
                            ` • ${booking.wheelchairUsers} wheelchair user${
                              booking.wheelchairUsers !== 1 ? "s" : ""
                            }`}
                        </div>

                        {/* Driver Info */}
                        {bookingType === "advanced" &&
                          booking.status === "ACCEPTED" &&
                          booking.acceptedBid && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                              <p className="font-medium text-green-900">
                                Driver: {booking.acceptedBid.driver.name}
                              </p>
                              <p className="text-green-700">
                                {booking.acceptedBid.driver.vehicleType} •{" "}
                                {booking.acceptedBid.driver.phone}
                              </p>
                            </div>
                          )}

                        {bookingType === "instant" &&
                          booking.assignedDriver && (
                            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                              <p className="font-medium text-purple-900">
                                Driver: {booking.assignedDriver.user.name}
                              </p>
                              <p className="text-purple-700">
                                {booking.assignedDriver.user.phone}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Right Side - Actions/Price */}
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          {/* Booking Type Badge */}
                            {bookingType === "instant" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Zap className="w-3 h-3 mr-1" />
                            Instant
                            </span>
                            ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            Advanced
                          </span>
                            )}

                          {/* Status Badge */}
                            {getStatusBadge(booking.status)}
                            </div>
                        {bookingType === "advanced" &&
                          booking.status === "ACCEPTED" &&
                          booking.acceptedBid && (
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(booking.acceptedBid.amountCents)}
                            </div>
                          )}

                        {bookingType === "advanced" &&
                          booking.status === "OPEN" &&
                          lowestBid && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Lowest bid
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(lowestBid.amountCents)}
                              </p>
                            </div>
                          )}

                        {bookingType === "advanced" &&
                          booking.status === "OPEN" &&
                          booking.bids.length > 0 && (
                            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                              Review Bids
                            </button>
                          )}
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}
        </div>
             {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <Link
            href={`?type=${bookingType}&filter=${currentFilter}&search=${currentSearch}&page=${Math.max(1, currentPage - 1)}`}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={(e) => currentPage === 1 && e.preventDefault()}
          >
            ← Previous
          </Link>

          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <Link
            href={`?type=${bookingType}&filter=${currentFilter}&search=${currentSearch}&page=${Math.min(totalPages, currentPage + 1)}`}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={(e) => currentPage === totalPages && e.preventDefault()}
          >
            Next →
          </Link>
        </div>
      )}
    </div>


      </div>
    
  );
}