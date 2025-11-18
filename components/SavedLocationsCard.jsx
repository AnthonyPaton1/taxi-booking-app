"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * SavedLocationsCard - Quick Access Component
 * 
 * Compact card showing most-used locations with link to full management
 * Perfect for coordinator dashboard main view
 */
export default function SavedLocationsCard() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/saved-locations");
      const data = await res.json();
      
      if (res.ok) {
        // Show top 3 most-used locations
        setLocations((data.savedLocations || []).slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Locations</h3>
        </div>
        <Link
          href="/dashboard/coordinator/locations"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Manage All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-6">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No saved locations yet</p>
          <Link
            href="/dashboard/coordinator/locations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {location.name}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {location.address}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-medium text-gray-700">
                    {location.postcode}
                  </span>
                  <span className="text-xs text-gray-500">
                    Used {location.useCount}x
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {locations.length >= 3 && (
            <Link
              href="/dashboard/coordinator/locations"
              className="block text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all locations →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}