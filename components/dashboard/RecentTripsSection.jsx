"use client";
import { useRouter } from "next/navigation";
import TripPreview from "./TripPreview";
import Link from "next/link";

export default function RecentTripsSection({ trips }) {
  const router = useRouter();

  // Only show first 3 trips
  const previewTrips = trips?.slice(0, 3) || [];
  const totalTrips = trips?.length || 0;

  // Handle repeat trip
  const handleRepeatTrip = (trip) => {
    // Store trip data in sessionStorage for pre-filling
    // Data structure matches your actual schema
    const repeatData = {
      pickupLocation: trip.pickupLocation,
      dropoffLocation: trip.dropoffLocation,
      // Get accessibility data from the nested profile
      passengerCount: trip.accessibilityProfile?.passengerCount || 1,
      wheelchairUsers: trip.accessibilityProfile?.wheelchairUsers || 0,
      wheelchairAccess: trip.accessibilityProfile?.wheelchairAccess || false,
      carerPresent: trip.accessibilityProfile?.carerPresent || false,
      femaleDriverOnly: trip.accessibilityProfile?.femaleDriverOnly || false,
      quietEnvironment: trip.accessibilityProfile?.quietEnvironment || false,
      assistanceRequired: trip.accessibilityProfile?.assistanceRequired || false,
      noConversation: trip.accessibilityProfile?.noConversation || false,
      visualSchedule: trip.accessibilityProfile?.visualSchedule || false,
      assistanceAnimal: trip.accessibilityProfile?.assistanceAnimal || false,
      familiarDriverOnly: trip.accessibilityProfile?.familiarDriverOnly || false,
      escortRequired: trip.accessibilityProfile?.escortRequired || false,
      signLanguageRequired: trip.accessibilityProfile?.signLanguageRequired || false,
      textOnlyCommunication: trip.accessibilityProfile?.textOnlyCommunication || false,
      medicationOnBoard: trip.accessibilityProfile?.medicationOnBoard || false,
      additionalNeeds: trip.accessibilityProfile?.additionalNeeds || "",
      // Intentionally NOT including date/time - manager must set new ones!
    };

    sessionStorage.setItem("repeatBookingData", JSON.stringify(repeatData));
    
    // Navigate to create booking page with repeat flag
    router.push(`/dashboard/manager/book-ride?repeat=${trip.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg 
            className="w-5 h-5 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Recent Trips
        </h2>
        <Link
          href="/dashboard/manager/trips"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View All{totalTrips > 0 ? ` (${totalTrips})` : ''}
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </Link>
      </div>

      {/* Trip Previews */}
      {previewTrips.length === 0 ? (
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
          <p className="text-gray-600 text-lg mb-1">No completed trips yet</p>
          <p className="text-gray-500 text-sm">
            Complete your first booking to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {previewTrips.map((trip) => (
            <TripPreview 
              key={trip.id} 
              trip={trip} 
              onRepeat={handleRepeatTrip}
            />
          ))}
        </div>
      )}

      {/* View All Link (Bottom) */}
      {totalTrips > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/manager/trips"
            className="block text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All {totalTrips} Trips →
          </Link>
        </div>
      )}
    </div>
  );
}