// components/dashboard/driver/WeeklyScheduleClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  PoundSterling,
  ChevronRight,
  Accessibility,
  ArrowLeft,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/dateUtils";

export default function WeeklyScheduleClient({
  bookingsByDay,
  stats,
  driverName,
}) {
  const [selectedDay, setSelectedDay] = useState(null);

  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amountCents / 100);
  };



  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { weekday: "long" });
  };

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/driver">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Weekly Schedule
            </h1>
            <p className="text-gray-600 mt-1">
              Your upcoming jobs for the next 7 days
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon="📅"
            color="blue"
          />
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Busiest Day"
            value={
              stats.busiestDay.date
                ? `${getDayName(stats.busiestDay.date)} (${
                    stats.busiestDay.count
                  })`
                : "No jobs yet"
            }
            icon="🔥"
            color="orange"
          />
        </div>

        {/* Weekly Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Next 7 Days
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Object.entries(bookingsByDay).map(([date, bookings]) => (
              <DayCard
                key={date}
                date={date}
                bookings={bookings}
                isToday={isToday(date)}
                onClick={() =>
                  setSelectedDay(selectedDay === date ? null : date)
                }
                isSelected={selectedDay === date}
              />
            ))}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {getDayName(selectedDay)} - {formatDate(selectedDay)}
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {bookingsByDay[selectedDay].length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No jobs scheduled for this day
              </p>
            ) : (
              <div className="space-y-3">
                {bookingsByDay[selectedDay].map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    formatTime={formatTime}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Bookings List (Expandable) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Upcoming Jobs ({stats.totalJobs})
          </h2>

          {stats.totalJobs === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No upcoming jobs</p>
              <p className="text-gray-500 text-sm mb-4">
                Browse available bookings to start earning
              </p>
              <Link href="/dashboard/driver/available-advanced">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  View Available Jobs
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(bookingsByDay).map(([date, bookings]) => {
                if (bookings.length === 0) return null;
                return (
                  <div key={date}>
                    <h3 className="font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-2">
                      {getDayName(date)} - {formatDate(date)}
                    </h3>
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        formatTime={formatTime}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Day Card Component
const DayCard = ({ date, bookings, isToday, onClick, isSelected }) => {
  const dayName = new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
  });
  const dayNumber = new Date(date).getDate();

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : isToday
          ? "border-green-400 bg-green-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-gray-600 uppercase">
          {dayName}
        </p>
        <p className="text-2xl font-bold text-gray-900 my-1">{dayNumber}</p>
        <div
          className={`text-sm font-semibold ${
            bookings.length === 0
              ? "text-gray-400"
              : bookings.length <= 2
              ? "text-green-600"
              : bookings.length <= 5
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {bookings.length} {bookings.length === 1 ? "job" : "jobs"}
        </div>
        {bookings.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(
              bookings.reduce(
                (sum, b) => sum + (b.acceptedBid?.amountCents || b.finalCostPence || 0),
                0
              )
            )}
          </p>
        )}
      </div>
    </button>
  );
};


// Booking Card Component
const BookingCard = ({ booking, formatTime, formatCurrency }) => {
 const bookingUrl = `/dashboard/driver/bookings/${booking.id}`;


return (
    <Link href={bookingUrl}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900">
                {formatTime(booking.pickupTime)}
              </span>
              {/* ✅ Show status instead of type */}
              <span
                className={`text-xs px-2 py-1 rounded ${
                  booking.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "BID_ACCEPTED"
                    ? "bg-blue-100 text-blue-800"
                    : booking.status === "ACCEPTED"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "IN_PROGRESS"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status}
              </span>
              {booking.accessibilityProfile?.wheelchairUsersStaySeated > 0 && (
                <Accessibility className="w-4 h-4 text-purple-600" />
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.pickupLocation}
                  </p>
                  <p className="text-gray-500">→ {booking.dropoffLocation}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {booking.createdBy?.name} • {booking.createdBy?.phone || "No phone"}
              </div>

              {booking.initials && booking.initials.length > 0 && (
                <p className="text-xs text-gray-500">
                  Passengers: {booking.initials.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            {/* ✅ Show accepted bid amount if exists */}
            {booking.acceptedBid && (
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(booking.acceptedBid.amountCents)}
              </p>
            )}
            {/* ✅ Or show final cost if directly assigned */}
            {!booking.acceptedBid && booking.finalCostPence && (
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(booking.finalCostPence)}
              </p>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mt-2" />
          </div>
        </div>
      </div>
    </Link>
  );
};


// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-sm font-medium opacity-75">{title}</h3>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const formatCurrency = (amountCents) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountCents / 100);
};