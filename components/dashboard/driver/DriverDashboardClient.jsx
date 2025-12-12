// components/dashboard/driver/DriverDashboardClient.jsx

"use client";

import Link from "next/link";
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Clock,
  AlertCircle,
  CheckCircle,
  Lock,
  Zap,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DriverDashboardClient({ 
  driver, 
  stats, 
  upcomingBookings = [],
}) {
  // Feature flag for subscriptions
  const SUBSCRIPTIONS_ENABLED = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {driver.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your dashboard overview
          </p>
        </div>

        {/* Subscription Status */}
        {SUBSCRIPTIONS_ENABLED && (
          <>
            {!driver.isSubscribed ? (
              // NOT SUBSCRIBED - Show prominent banner
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-white" />
                      <div>
                        <p className="text-white font-bold text-lg">
                          Subscribe to Start Earning
                        </p>
                        <p className="text-white text-sm">
                          {stats.availableBookings} bookings available near you
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold text-2xl">£125/month</p>
                        <p className="text-white text-xs">Just £4/day</p>
                      </div>
                      <Button 
                        asChild
                        className="bg-white text-orange-600 hover:bg-gray-100 font-bold shadow-lg"
                        size="lg"
                      >
                        <Link href="/dashboard/driver/subscribe">
                          <Zap className="w-5 h-5 mr-2" />
                          Subscribe Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // SUBSCRIBED - Show minimal status badge
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {driver.subscriptionTier} Subscription Active
                    </p>
                    <p className="text-sm text-gray-600">
                      Next payment: {new Date(driver.subscriptionExpiresAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
                <Button 
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link href="/dashboard/driver/subscription">
                    Manage Subscription
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Available Bookings"
            value={stats.availableBookings}
            icon={Calendar}
            color="blue"
            locked={SUBSCRIPTIONS_ENABLED && !driver.isSubscribed}
          />
          <StatCard
            title="Active Bids"
            value={stats.activeBids}
            icon={TrendingUp}
            color="purple"
            locked={SUBSCRIPTIONS_ENABLED && !driver.isSubscribed}
          />
          <StatCard
            title="Completed Rides"
            value={driver.completedRides}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Rating"
            value={driver.rating ? driver.rating.toFixed(1) : "5.0"}
            icon={Star}
            color="yellow"
          />
        </div>

        {/* Main Content - Conditional based on subscription */}
        {SUBSCRIPTIONS_ENABLED && !driver.isSubscribed ? (
          // LOCKED VIEW - Show bookings but can't interact
          <div className="relative">
            {/* Blurred/Disabled Bookings */}
            <div className="opacity-50 pointer-events-none blur-sm">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Available Bookings
                </h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="h-20 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay with Subscribe CTA */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/95">
              <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md border-2 border-orange-400">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Subscribe to Start Bidding
                </h3>
                <p className="text-gray-600 mb-2">
                  {stats.availableBookings} bookings available near you
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Keep 100% of your fares • No commission • Cancel anytime
                </p>
                <Button 
                  asChild
                  size="lg"
                  className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href="/dashboard/driver/subscribe">
                    Subscribe for £125/month
                  </Link>
                </Button>
                <p className="text-xs text-gray-500">
                  Just £4/day • First 100 drivers get £99/month forever
                </p>
              </div>
            </div>
          </div>
        ) : (
          // ✅ FIXED: UNLOCKED VIEW - Full access
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                href="/dashboard/driver/available"
                className="block"
              >
                <div className="h-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-md rounded-lg p-6 transition cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 block mb-1">
                      View Available Bookings
                    </span>
                    <p className="text-sm text-gray-600">
                      {stats.availableBookings} bookings waiting
                    </p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/dashboard/driver/my-bids"
                className="block"
              >
                <div className="h-full bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-md rounded-lg p-6 transition cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 block mb-1">
                      My Bids
                    </span>
                    <p className="text-sm text-gray-600">
                      {stats.activeBids} active bids
                    </p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/dashboard/driver/schedule"
                className="block"
              >
                <div className="h-full bg-white border-2 border-green-200 hover:border-green-400 hover:shadow-md rounded-lg p-6 transition cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 block mb-1">
                      My Schedule
                    </span>
                    <p className="text-sm text-gray-600">
                      {upcomingBookings.length} upcoming
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* ✅ FIXED: Upcoming Bookings - Now shows correctly */}
            {upcomingBookings && upcomingBookings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Upcoming Bookings
                  </h2>
                  <Link 
                    href="/dashboard/driver/schedule"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/dashboard/driver/bookings/${booking.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {booking.pickupLocation} → {booking.dropoffLocation}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(booking.pickupTime).toLocaleString('en-GB', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-green-600 text-lg">
                            £{((booking.acceptedBid?.amountCents || 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.status}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Upcoming Bookings */}
            {(!upcomingBookings || upcomingBookings.length === 0) && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No Upcoming Bookings
                </h3>
                <p className="text-gray-600 mb-4">
                  Check out available bookings to place your bids
                </p>
                <Button asChild>
                  <Link href="/dashboard/driver/available">
                    View Available Bookings
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ✅ FIXED: Stat Card Component with proper background colors
function StatCard({ title, value, icon: Icon, color, locked = false }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-600"
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      text: "text-purple-600"
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      text: "text-green-600"
    },
    yellow: {
      bg: "bg-yellow-50",
      icon: "bg-yellow-100 text-yellow-600",
      text: "text-yellow-600"
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-lg shadow-sm p-6 relative border border-gray-100`}>
      {locked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
            {locked ? '—' : value}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}