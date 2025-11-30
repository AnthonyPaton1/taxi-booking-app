// components/dashboard/manager/BlockBookingCard.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Package,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDateTime } from "@/lib/dateUtils";
import { formatDate } from "@/lib/dateUtils";

export default function BlockBookingCard({ booking }) {
  const [isExpanded, setIsExpanded] = useState(false);

 

 

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, text: "Awaiting Bids" },
      ACCEPTED: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Driver Assigned" },
      COMPLETED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, text: "Completed" },
      CANCELED: { color: "bg-red-100 text-red-800", icon: AlertCircle, text: "Cancelled" },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  // Calculate completion status
  const completedRides = booking.blockRides?.filter(ride => ride.completed).length || 0;
  const totalRides = booking.totalRidesInBlock;
  const allCompleted = completedRides === totalRides;
  const inProgress = completedRides > 0 && completedRides < totalRides;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Block Booking Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Package className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">Block Booking</h3>
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                {totalRides} RIDES
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Created {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      {/* Progress Bar (if accepted and in progress) */}
      {booking.status === "ACCEPTED" && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {completedRides} / {totalRides} rides completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                allCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(completedRides / totalRides) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Journey Overview */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{booking.pickupLocation}</p>
            <p className="text-sm text-gray-500">to</p>
            <p className="font-medium text-gray-900">{booking.dropoffLocation}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}
          </div>
          {booking.roundTrip && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              Round Trip
            </span>
          )}
        </div>
      </div>

      {/* Block Notes */}
      {booking.blockNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">
            <strong>Block Notes:</strong> {booking.blockNotes}
          </p>
        </div>
      )}

      {/* Expandable Ride Schedule */}
      <div className="border-t pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left hover:bg-white rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">
              {isExpanded ? 'Hide' : 'Show'} Schedule ({totalRides} rides)
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isExpanded && booking.blockRides && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {booking.blockRides.map((ride, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-2 ${
                  ride.completed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ride.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(ride.date)}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Pickup: {ride.pickupTime}
                        </span>
                        {ride.returnTime && (
                          <span>Return: {ride.returnTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {ride.completed && (
                    <span className="text-xs font-medium text-green-700">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 pt-4 border-t">
        <Link
          href={`/dashboard/manager/bookings/${booking.id}`}
          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
        {booking.status === "ACCEPTED" && !allCompleted && (
          <Link
            href={`/dashboard/manager/bookings/${booking.id}/track`}
            className="flex-1 text-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Track Progress
          </Link>
        )}
      </div>
    </div>
  );
}