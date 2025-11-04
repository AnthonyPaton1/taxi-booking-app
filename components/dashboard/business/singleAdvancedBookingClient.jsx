// components/manager/SingleAdvancedBookingClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import StatusMessage from "@/components/shared/statusMessage";
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Accessibility,  
  Phone,
  Mail,
  MessageSquare,
  PoundSterling,     
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
   Edit,
   Trash2,
   ArrowLeft,
   X,
   Plus,
   Minus
} from "lucide-react";

export default function SingleAdvancedBookingClient({ booking }) {
  const [status, setStatus] = useState("");
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const router = useRouter();
  
  const activeBids = booking.bids.filter(bid => bid.status === "PENDING");
  const lowestBid = activeBids.length > 0 ? activeBids[0] : null;
  const averageBid = activeBids.length > 0 
    ? activeBids.reduce((sum, bid) => sum + bid.amountCents, 0) / activeBids.length 
    : 0;

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
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, text: "Awaiting Bids" },
      ACCEPTED: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Driver Assigned" },
      COMPLETED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, text: "Completed" },
      CANCELED: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Cancelled" },
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

  const handleAcceptBid = async (bidId) => {
    if (!confirm("Accept this bid? The driver will be notified and assigned to this booking.")) {
      return;
    }

    setStatus("loading");
    setSelectedBidId(bidId);

    try {
      const res = await fetch(`/api/bookings/${booking.id}/accept-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: booking.id, 
          bidId 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Bid accepted! Driver has been assigned.");
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus("❌ Failed to accept bid: " + data.error);
      }
    } catch (err) {
      console.error("Error accepting bid:", err);
      setStatus("❌ Something went wrong.");
    } finally {
      setSelectedBidId(null);
    }
  };

  const handleCancelBooking = async () => {
    const reason = prompt(
      "Please provide a reason for cancellation (optional):\n\n" +
      "Examples:\n" +
      "- Resident unwell\n" +
      "- Appointment rescheduled\n" +
      "- No longer needed"
    );

    if (reason === null) return;

    if (!confirm("Cancel this booking? This cannot be undone.")) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`/api/bookings/advanced/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Booking cancelled.");
        setTimeout(() => {
          router.push("/dashboard/manager/bookings");
          router.refresh();
        }, 1500);
      } else {
        setStatus("❌ Failed to cancel: " + data.error);
      }
    } catch (err) {
      console.error("Error cancelling:", err);
      setStatus("❌ Something went wrong.");
    }
  };

  // Generate next 14 days for calendar
  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const toggleDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existing = selectedDates.find(d => d.date === dateStr);
    
    if (existing) {
      setSelectedDates(selectedDates.filter(d => d.date !== dateStr));
    } else {
      // Get original booking times
      const originalPickup = new Date(booking.pickupTime);
      const pickupTime = `${String(originalPickup.getHours()).padStart(2, '0')}:${String(originalPickup.getMinutes()).padStart(2, '0')}`;
      
      let returnTime = '';
      if (booking.roundTrip && booking.returnTime) {
        const originalReturn = new Date(booking.returnTime);
        returnTime = `${String(originalReturn.getHours()).padStart(2, '0')}:${String(originalReturn.getMinutes()).padStart(2, '0')}`;
      }

      setSelectedDates([...selectedDates, {
        date: dateStr,
        pickupTime,
        returnTime: booking.roundTrip ? returnTime : null
      }]);
    }
  };

  const updateDateTime = (dateStr, field, value) => {
    setSelectedDates(selectedDates.map(d => 
      d.date === dateStr ? { ...d, [field]: value } : d
    ));
  };

  const handleCreateRepeatRides = async () => {
    if (selectedDates.length === 0) {
      alert("Please select at least one date");
      return;
    }

    if (!confirm(`Create ${selectedDates.length} repeat booking(s)?`)) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`/api/bookings/${booking.id}/repeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: booking.id,
          dates: selectedDates
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus(`✅ Created ${selectedDates.length} repeat booking(s)!`);
        setShowRepeatModal(false);
        setSelectedDates([]);
        setTimeout(() => {
          router.push("/dashboard/manager/bookings");
          router.refresh();
        }, 1500);
      } else {
        setStatus("❌ Failed to create repeat bookings: " + data.error);
      }
    } catch (err) {
      console.error("Error creating repeat bookings:", err);
      setStatus("❌ Something went wrong.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/manager/bookings"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Bookings
        </Link>
      </div>
      
      <StatusMessage message={status} type={status?.startsWith("❌") ? "error" : "info"} />

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-1">
            Created {formatDateTime(booking.createdAt)} by {booking.createdBy}
          </p>
        </div>
        <div>
          {getStatusBadge(booking.status)}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            {!booking.acceptedBidId && booking.status === "OPEN" && (
              <Link
                href={`/dashboard/manager/bookings/${booking.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </Link>
            )}
            
            {!booking.acceptedBidId && (
              <button
                onClick={handleCancelBooking}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Repeat Ride Section */}
      {booking.status === "ACCEPTED" && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md border-2 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Need this ride regularly?
              </h3>
              <p className="text-gray-600 mb-1">
                Repeat this ride over the next 2 weeks with the same pickup and dropoff locations
              </p>
              <p className="text-sm text-gray-500">
                Select multiple dates and customize times for each ride
              </p>
            </div>
            <Button
              onClick={() => setShowRepeatModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Set up repeat rides
            </Button>
          </div>
        </div>
      )}

      {/* Repeat Ride Modal */}
      {showRepeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Set Up Repeat Rides</h2>
              <button
                onClick={() => {
                  setShowRepeatModal(false);
                  setSelectedDates([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Original Booking Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Original Booking Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">From:</span> {booking.pickupLocation}</p>
                  <p><span className="font-medium">To:</span> {booking.dropoffLocation}</p>
                  <p><span className="font-medium">Residents:</span> {booking.initials.join(", ")}</p>
                  <p><span className="font-medium">Passengers:</span> {booking.passengerCount}</p>
                  {booking.roundTrip && <p className="text-blue-600 font-medium">Round Trip</p>}
                </div>
              </div>

              {/* Calendar Selection */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Select Dates (Next 14 Days)</h3>
                <div className="grid grid-cols-7 gap-2">
                  {getNext14Days().map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDates.some(d => d.date === dateStr);
                    const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
                    const dayNum = date.getDate();
                    
                    return (
                      <button
                        key={dateStr}
                        onClick={() => toggleDate(date)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-xs font-medium">{dayName}</div>
                        <div className="text-lg font-bold">{dayNum}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Dates with Times */}
              {selectedDates.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Selected Dates & Times ({selectedDates.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedDates.sort((a, b) => a.date.localeCompare(b.date)).map((dateObj) => {
                      const date = new Date(dateObj.date + 'T12:00:00');
                      const displayDate = date.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      });
                      
                      return (
                        <div key={dateObj.date} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{displayDate}</span>
                            <button
                              onClick={() => toggleDate(date)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">
                                Pickup Time
                              </label>
                              <input
                                type="time"
                                value={dateObj.pickupTime}
                                onChange={(e) => updateDateTime(dateObj.date, 'pickupTime', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            {booking.roundTrip && (
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">
                                  Return Time
                                </label>
                                <input
                                  type="time"
                                  value={dateObj.returnTime || ''}
                                  onChange={(e) => updateDateTime(dateObj.date, 'returnTime', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowRepeatModal(false);
                    setSelectedDates([]);
                  }}
                  variant="outline"
                  disabled={status === "loading"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRepeatRides}
                  disabled={selectedDates.length === 0 || status === "loading"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {status === "loading" 
                    ? "Creating..." 
                    : `Create ${selectedDates.length} Booking${selectedDates.length !== 1 ? 's' : ''}`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Journey Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-24 text-gray-600 font-medium">Pickup:</div>
                <div className="flex-1">
                  <p className="text-gray-900">{booking.pickupLocation}</p>
                  <p className="text-sm text-gray-500">{booking.pickupPostcode}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-24 text-gray-600 font-medium">Dropoff:</div>
                <div className="flex-1">
                  <p className="text-gray-900">{booking.dropoffLocation}</p>
                  <p className="text-sm text-gray-500">{booking.dropoffPostcode}</p>
                </div>
              </div>

              <div className="flex items-center pt-3 border-t">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-gray-900 font-medium">
                  {formatDateTime(booking.pickupTime)}
                </span>
              </div>

              {booking.roundTrip && booking.returnTime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-900">
                    Return: {new Date(booking.returnTime).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Resident Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Resident Information
            </h2>

            <div className="space-y-2">
              <p><span className="font-medium">Residents:</span> {booking.initials.join(", ")}</p>
              <p><span className="font-medium">Business:</span> {booking.business?.name || "N/A"}</p>
              <p className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-600" />
                {booking.passengerCount} passenger{booking.passengerCount > 1 ? "s" : ""}
              </p>
              {booking.wheelchairUsers > 0 && (
                <p className="flex items-center">
                  <Accessibility className="w-4 h-4 mr-2 text-gray-600" />
                  {booking.wheelchairUsers} wheelchair user{booking.wheelchairUsers > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Special Requirements */}
          {(booking.additionalNeeds || booking.wheelchairAccess || booking.femaleDriverOnly) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Special Requirements</h2>
              
              <div className="space-y-2">
                {booking.wheelchairAccess && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Wheelchair Access Required
                  </p>
                )}
                {booking.femaleDriverOnly && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Female Driver Only
                  </p>
                )}
                {booking.carerPresent && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Carer Present
                  </p>
                )}
                {booking.assistanceAnimal && (
                  <p className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Assistance Animal
                  </p>
                )}
                {booking.additionalNeeds && (
                  <div className="pt-2 border-t">
                    <p className="font-medium text-gray-700">Additional Notes:</p>
                    <p className="text-gray-600 mt-1">{booking.additionalNeeds}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manager Notes (Internal) */}
          {booking.managerNotes && (
            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-yellow-600" />
                Internal Manager Notes
              </h2>
              <p className="text-gray-700">{booking.managerNotes}</p>
              <p className="text-sm text-gray-500 mt-2">🔒 Not visible to drivers</p>
            </div>
          )}
        </div>

        {/* Right Column - Bids */}
        <div className="space-y-6">
          {/* Bid Statistics */}
          {activeBids.length > 0 && lowestBid && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Bid Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Bids:</span>
                  <span className="font-bold text-lg">{activeBids.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lowest Bid:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(lowestBid.amountCents / 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Bid:</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(averageBid)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Driver Bids */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <PoundSterling className="w-5 h-5 mr-2 text-blue-600" />
              Driver Bids ({activeBids.length})
            </h2>

            {booking.status === "ACCEPTED" && booking.acceptedBid ? (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-bold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Driver Assigned
                </p>
                <div className="space-y-2">
                  <p className="font-medium">{booking.acceptedBid.driver.user.name}</p>
                  <p className="text-sm flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2" />
                    {booking.acceptedBid.driver.user.phone}
                  </p>
                  <p className="text-sm flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-2" />
                    {booking.acceptedBid.driver.user.email}
                  </p>
                  <p className="text-lg font-bold text-green-700 mt-3">
                    {formatCurrency(booking.acceptedBid.amountCents / 100)}
                  </p>
                </div>
              </div>
            ) : activeBids.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No bids yet</p>
                <p className="text-sm mt-1">Drivers will be notified of this booking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">
                          {bid.driver.user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {bid.driver.vehicleType} - {bid.driver.vehicleCapacity} seats
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Lowest
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(bid.amountCents / 100)}
                      </span>
                      <Button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={status === "loading" && selectedBidId === bid.id}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        size="sm"
                      >
                        {status === "loading" && selectedBidId === bid.id
                          ? "Accepting..."
                          : "Accept Bid"}
                      </Button>
                    </div>

                    {bid.message && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-sm text-gray-600">{bid.message}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Bid placed {formatDateTime(bid.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {booking.status === "PENDING" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-3">Actions</h3>
              <Button
                onClick={handleCancelBooking}
                disabled={status === "loading"}
                variant="destructive"
                className="w-full"
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}