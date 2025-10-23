"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TripCard from "./TripCard";
import { getRecentTripsForHouse, getTripsByPassenger } from "@/app/actions/recentTripsActions";

export default function RecentTrips({ houseId, initialTrips = [] }) {
  const router = useRouter();
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" or passenger initials
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique passengers from trips
  const passengers = [...new Set(trips.map(trip => trip.passenger.initials))];

  // Filter trips based on search and passenger filter
  const filteredTrips = trips.filter(trip => {
    const matchesPassenger = filter === "all" || trip.passenger.initials === filter;
    const matchesSearch = searchTerm === "" || 
      trip.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.tripPurpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPassenger && matchesSearch;
  });

  // Handle repeat trip
  const handleRepeatTrip = (tripId, bookingType) => {
    // Store trip data in sessionStorage for pre-filling
    const repeatData = {
      pickupLocation: tripId.pickupLocation,
      dropoffLocation: tripId.dropoffLocation,
      passengerInitials: tripId.passenger.initials,
      passengerId: tripId.passenger.id,
      wheelchairUsers: tripId.wheelchairUsers,
      totalPassengers: tripId.totalPassengers,
      accessibilityRequirements: tripId.accessibilityRequirements || [],
      tripPurpose: tripId.tripPurpose,
      notes: tripId.notes,
      // Intentionally NOT including date/time - manager must set new ones!
    };

    sessionStorage.setItem("repeatBookingData", JSON.stringify(repeatData));
     if (bookingType === 'instant') {
    router.push(`/dashboard/manager/instant-booking?repeat=${tripId}`);
  } else {
    router.push(`/dashboard/manager/book-ride?repeat=${tripId}`);
  }
    
    // Navigate to create booking page with repeat flag
    router.push(`/dashboard/manager/book-ride?repeat=${tripId}`);
  };

  // Refresh trips
  const refreshTrips = async () => {
    setLoading(true);
    try {
      const freshTrips = await getRecentTripsForHouse(houseId);
      setTrips(freshTrips);
    } catch (error) {
      console.error("Failed to refresh trips:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by passenger
  const handlePassengerFilter = async (passengerInitials) => {
    setFilter(passengerInitials);
    
    if (passengerInitials === "all") {
      refreshTrips();
      return;
    }

    setLoading(true);
    try {
      const passengerTrips = await getTripsByPassenger(houseId, passengerInitials);
      setTrips(passengerTrips);
    } catch (error) {
      console.error("Failed to filter trips:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Trips</h2>
       <div className="flex gap-2">
  <button onClick={() => handleRepeatTrip(tripId, 'advanced')}>
    🔄 Book Advanced
  </button>
  <button onClick={() => handleRepeatTrip(tripId, 'instant')}>
    ⚡ Book Instant
  </button>
          {loading ? "Refreshing..." : "Refresh"}
</div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search by destination or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Passenger Filter */}
        {passengers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePassengerFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Passengers
            </button>
            {passengers.map((initials) => (
              <button
                key={initials}
                onClick={() => handlePassengerFilter(initials)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === initials
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {initials}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {searchTerm || filter !== "all" ? (
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredTrips.length} of {trips.length} trips
        </p>
      ) : null}

      {/* Trip Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading trips...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== "all"
              ? "Try adjusting your filters"
              : "Start by creating your first booking"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onRepeat={handleRepeatTrip} />
          ))}
        </div>
      )}
    </div>
  );
}