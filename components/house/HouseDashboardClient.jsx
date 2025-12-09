// components/house/HouseDashboardClient.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  LogOut,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HouseDashboardClient({ houseId, houseName, houseAddress }) {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [tripsByDate, setTripsByDate] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("today"); // "today" or "week"
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`/api/house/trips?view=${view}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trips");
      }

      setTrips(data.trips);
      setTripsByDate(data.tripsByDate);
      setStats(data.stats);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchTrips(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [view]);

  const handleLogout = async () => {
    try {
      await fetch("/api/house/logout", { method: "POST" });
      router.push("/house/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const formatCurrency = (pence) => {
    if (!pence) return "TBC";
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  };

  const TripCard = ({ trip }) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-4">
      {/* Resident */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <User className="w-6 h-6 text-blue-600" />
        <div>
          <p className="text-xl font-bold text-gray-900">{trip.residentName}</p>
          <p className="text-sm text-gray-600">{trip.residentInitials}</p>
        </div>
      </div>

      {/* Outbound Trip */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-blue-900 uppercase">Outbound</p>
        
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(trip.outbound.time)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Drop off at:</p>
            <p className="text-lg font-semibold text-gray-900">
              {trip.outbound.dropoff}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-blue-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">{trip.outbound.driverName}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(trip.outbound.costPence)}
            </span>
          </div>
        </div>
      </div>

      {/* Return Trip */}
      {trip.return && (
        <div className="bg-green-50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-green-900 uppercase">Return</p>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(trip.return.time)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Pick up from:</p>
              <p className="text-lg font-semibold text-gray-900">
                {trip.return.pickup}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">{trip.return.driverName}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(trip.return.costPence)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{houseName}</h1>
                <p className="text-sm text-gray-600">{houseAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTrips(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setView("today")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "today"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {view === "today" ? (
          // Today's view
          trips.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No trips scheduled today
              </h3>
              <p className="text-gray-600">Enjoy a quiet day!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Today's Trips ({trips.length})
              </h2>
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )
        ) : (
          // Weekly view
          Object.keys(tripsByDate).length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No trips scheduled this week
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(tripsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dateTrips]) => (
                  <div key={date}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 sticky top-24 bg-gray-50 py-2">
                      {formatDate(date)} ({dateTrips.length} {dateTrips.length === 1 ? "trip" : "trips"})
                    </h2>
                    <div className="space-y-4">
                      {dateTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )
        )}

        {/* Incident Report Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/house/incident")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Report an Incident
          </Button>
        </div>
      </div>
    </div>
  );
}