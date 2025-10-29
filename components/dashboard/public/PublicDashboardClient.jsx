// components/dashboard/public/publicDashboardClient.jsx
"use client";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function PublicDashboardClient({ user, activeBookings, stats }) {
  return (
    <>
      {/* Skip to main content link for keyboard users */}
      
    <a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
>
  Skip to main content
</a>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Header */}
          <header className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-gray-600 mt-1" id="dashboard-description">
              Manage your transport bookings and view driver bids
            </p>
          </header>

          {/* Stats - Accessible cards */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">
              Booking statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Active Bookings"
                value={stats.active}
                color="blue"
                icon={<Calendar className="w-6 h-6" aria-hidden="true" />}
                description="Upcoming transport bookings"
              />
              <StatCard
                title="Needs Your Action"
                value={stats.awaitingAction}
                color="yellow"
                icon={<AlertCircle className="w-6 h-6" aria-hidden="true" />}
                description="Bids waiting for your review"
                highlight={stats.awaitingAction > 0}
              />
              <StatCard
                title="Past Bookings"
                value={stats.past}
                color="gray"
                icon={<CheckCircle className="w-6 h-6" aria-hidden="true" />}
                description="Completed or cancelled bookings"
              />
            </div>
          </section>

          {/* Attention Banner - Live region for screen readers */}
          {stats.awaitingAction > 0 && (
            <div
              role="alert"
              aria-live="polite"
              className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="w-6 h-6 text-yellow-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 text-lg">
                    {stats.awaitingAction} booking
                    {stats.awaitingAction !== 1 ? "s need" : " needs"} your
                    attention
                  </h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Drivers have submitted bids. Review and accept a driver to
                    confirm your booking.
                  </p>
                </div>
                <Link
                  href="#bookings-needing-review"
                  className="bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Review Bids
                  <span className="sr-only">
                    for {stats.awaitingAction} booking
                    {stats.awaitingAction !== 1 ? "s" : ""}
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <section aria-labelledby="quick-actions-heading">
            <h2 id="quick-actions-heading" className="sr-only">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickActionCard
                href="/book-ride"
                icon={<Plus className="w-6 h-6" aria-hidden="true" />}
                title="Book New Journey"
                description="Schedule your next transport booking"
                color="blue"
              />
              <QuickActionCard
                href="/dashboard/public/history"
                icon={<Clock className="w-6 h-6" aria-hidden="true" />}
                title="View History"
                description="See your past bookings and journeys"
                color="gray"
              />
            </div>
          </section>

          {/* Active Bookings */}
          <main id="main-content">
            <section aria-labelledby="active-bookings-heading">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2
                    id="active-bookings-heading"
                    className="text-2xl font-semibold text-gray-900"
                  >
                    Your Active Bookings
                  </h2>
                  <Link
                    href="/dashboard/public/history"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:ring-2 focus:ring-blue-500 focus:rounded px-2 py-1"
                  >
                    View all bookings
                    <span className="sr-only"> including past bookings</span>
                  </Link>
                </div>

                {activeBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600 text-lg mb-2">
                      No active bookings
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      Book your first journey to get started
                    </p>
                    <Link
                      href="/book-ride"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" aria-hidden="true" />
                      Book First Journey
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4" id="bookings-needing-review">
                    {activeBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

// Accessible Stat Card
const StatCard = ({ title, value, color, icon, description, highlight }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  return (
    <article
      className={`${colors[color]} ${
        highlight ? "ring-2 ring-yellow-400" : ""
      } border-2 rounded-lg p-5`}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div aria-hidden="true">{icon}</div>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1" aria-label={`${value} ${title}`}>
        {value}
      </p>
      <p className="text-sm opacity-75">{description}</p>
    </article>
  );
};

// Accessible Quick Action Card
const QuickActionCard = ({ href, icon, title, description, color }) => {
  const colors = {
    blue: "border-blue-200 hover:bg-blue-50 focus-within:ring-blue-500",
    gray: "border-gray-200 hover:bg-gray-50 focus-within:ring-gray-500",
  };

  return (
    <Link
      href={href}
      className={`block bg-white border-2 ${colors[color]} rounded-lg p-6 transition-colors focus:outline-none focus:ring-4 group`}
      aria-label={`${title}: ${description}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
};

// Accessible Booking Card
const BookingCard = ({ booking }) => {
  const pickupTime = new Date(booking.pickupTime);
  const hasBids = booking.bids && booking.bids.length > 0;
  const isAccepted = booking.status === "ACCEPTED";
  const needsAction = hasBids && !isAccepted;

  // Format date accessibly
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
        className="block border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg p-5 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 group"
        aria-label={`Booking from ${booking.pickupLocation} to ${booking.dropoffLocation} on ${dateString} at ${timeString}${
          needsAction ? ". Action required: review bids" : ""
        }`}
      >
   <div className="flex items-start justify-between gap-4">
  <div className="flex-1 space-y-3">
    {/* Date/Time with semantic markup */}
    <div className="flex items-center gap-3 flex-wrap">
      <time
        dateTime={booking.pickupTime}
        className="text-sm font-semibold text-gray-900"
      >
        <Calendar
          className="w-4 h-4 inline mr-1"
          aria-hidden="true"
        />
        {dateString} at {timeString}
      </time>
      <StatusBadge
        isAccepted={isAccepted}
        hasBids={hasBids}
        bidCount={booking.bids?.length || 0}
      />
    </div>

    {/* Journey details */}
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
      <div
        className="bg-green-50 border border-green-200 rounded p-3 text-sm"
        role="status"
      >
        <p className="font-medium text-green-900">
          <CheckCircle
            className="w-4 h-4 inline mr-1"
            aria-hidden="true"
          />
          Driver Confirmed: {booking.acceptedBid.driver.name}
        </p>
        <p className="text-green-700 mt-1">
          {booking.acceptedBid.driver.vehicleType} •{" "}
          
           <a href={`tel:${booking.acceptedBid.driver.phone}`}
            className="underline hover:no-underline focus:ring-2 focus:ring-green-500 rounded"
            onClick={(e) => e.stopPropagation()}
          > 
            {booking.acceptedBid.driver.phone}
          </a>
        </p>
      </div>
    )}
  </div>

          {/* Action button if needs attention */}
          {needsAction && (
            <Link
              href={`/dashboard/public/bookings/${booking.id}`}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white text-sm px-4 py-2 rounded-lg font-medium min-w-[100px] transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Review ${booking.bids.length} bid${
                booking.bids.length !== 1 ? "s" : ""
              } for this booking`}
            >
              Review Bids
            </Link>
          )}
        </div>
      </Link>
    </li>
  );
};

// Accessible Status Badge
const StatusBadge = ({ isAccepted, hasBids, bidCount }) => {
  if (isAccepted) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        role="status"
        aria-label="Booking confirmed with driver"
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
        aria-label={`${bidCount} bid${
          bidCount !== 1 ? "s" : ""
        } received, awaiting your review`}
      >
        <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
        {bidCount} Bid{bidCount !== 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
      role="status"
      aria-label="Awaiting bids from drivers"
    >
      <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
      Awaiting Bids
    </span>
  );
};