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
  Zap
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
              <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
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
            value={driver.rating.toFixed(1)}
            icon={DollarSign}
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
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
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
                  className="w-full mb-3"
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
          // UNLOCKED VIEW - Full access
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button 
                asChild
                className="h-auto py-6 bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/dashboard/driver/available">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-lg font-semibold">View Available Bookings</span>
                    <p className="text-sm opacity-90 mt-1">
                      {stats.availableBookings} bookings waiting
                    </p>
                  </div>
                </Link>
              </Button>

              <Button 
                asChild
                variant="outline"
                className="h-auto py-6"
              >
                <Link href="/dashboard/driver/my-bids">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-lg font-semibold">My Bids</span>
                    <p className="text-sm opacity-90 mt-1">
                      {stats.activeBids} active bids
                    </p>
                  </div>
                </Link>
              </Button>

              <Button 
                asChild
                variant="outline"
                className="h-auto py-6"
              >
                <Link href="/dashboard/driver/schedule">
                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-lg font-semibold">My Schedule</span>
                    <p className="text-sm opacity-90 mt-1">
                      {upcomingBookings.length} upcoming
                    </p>
                  </div>
                </Link>
              </Button>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upcoming Bookings
                </h2>
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/dashboard/driver/bookings/${booking.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {booking.pickupLocation} → {booking.dropoffLocation}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.pickupTime).toLocaleString('en-GB')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            £{(booking.acceptedBid?.amountCents / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, locked = false }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {locked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
            {locked ? '—' : value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}