// components/booking/BlockBookingSection.jsx
"use client";


import { Calendar, Info, Plus, Minus, Clock } from "lucide-react";

export default function BlockBookingSection({ 
  isBlockBooking, 
  setIsBlockBooking, 
  blockRides, 
  setBlockRides,
  blockNotes,
  setBlockNotes,
  roundTrip 
}) {
  // Generate next 14 days for selection
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
    const existing = blockRides.find(r => r.date === dateStr);
    
    if (existing) {
      setBlockRides(blockRides.filter(r => r.date !== dateStr));
    } else {
      setBlockRides([...blockRides, {
        date: dateStr,
        pickupTime: '09:00',
        returnTime: roundTrip ? '14:00' : null
      }].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  const updateRideTime = (dateStr, field, value) => {
    setBlockRides(blockRides.map(r => 
      r.date === dateStr ? { ...r, [field]: value } : r
    ));
  };

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex items-start gap-3 mb-4">
        <Calendar className="w-6 h-6 text-blue-600 mt-1" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Block Booking (Optional)
          </h3>
          <p className="text-sm text-gray-600">
            Schedule multiple rides with the same details as a single contract
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>💡 What is a Block Booking?</strong></p>
            <p>
              Schedule multiple rides over the next 2 weeks. Drivers will bid on the 
              <strong> ENTIRE block as one contract</strong>, not per individual ride.
            </p>
            <p className="text-blue-700 font-medium">
              ⚠️ All-or-nothing: Driver must commit to ALL rides in the block
            </p>
          </div>
        </div>
      </div>

      {/* Enable Block Booking Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors mb-4">
        <input
          type="checkbox"
          checked={isBlockBooking}
          onChange={(e) => {
            setIsBlockBooking(e.target.checked);
            if (!e.target.checked) {
              setBlockRides([]);
              setBlockNotes('');
            }
          }}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <div>
          <span className="font-medium text-gray-900">Make this a block booking</span>
          <p className="text-sm text-gray-600">Select multiple dates for recurring journeys</p>
        </div>
      </label>

      {/* Date Selection */}
      {isBlockBooking && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Calendar Grid */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Select Dates (Next 14 Days)
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {getNext14Days().map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = blockRides.some(r => r.date === dateStr);
                const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString('en-GB', { month: 'short' });
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => toggleDate(date)}
                    className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-medium">{dayName}</div>
                    <div className="text-lg font-bold">{dayNum}</div>
                    <div className="text-xs text-gray-500">{monthName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Rides Summary */}
          {blockRides.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  Selected Rides ({blockRides.length})
                </h4>
                <span className="text-sm text-gray-600">
                  Drivers will bid on all {blockRides.length} rides as one contract
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {blockRides.map((ride) => {
                  const date = new Date(ride.date + 'T12:00:00');
                  const displayDate = date.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  });
                  
                  return (
                    <div key={ride.date} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{displayDate}</span>
                        <button
                          type="button"
                          onClick={() => toggleDate(date)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Remove this date"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600  mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pickup Time
                          </label>
                          <input
                            type="time"
                            value={ride.pickupTime}
                            onChange={(e) => updateRideTime(ride.date, 'pickupTime', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        {roundTrip && (
                          <div>
                            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Return Time
                            </label>
                            <input
                              type="time"
                              value={ride.returnTime || ''}
                              onChange={(e) => updateRideTime(ride.date, 'returnTime', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              required={roundTrip}
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

          {/* Block Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block Booking Notes (Optional)
            </label>
            <textarea
              value={blockNotes}
              onChange={(e) => setBlockNotes(e.target.value)}
              placeholder="E.g., 'Patient requires consistent driver for dialysis appointments' or 'Same driver preferred for comfort'"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be visible to drivers when bidding on the block
            </p>
          </div>

          {/* Validation Warning */}
          {isBlockBooking && blockRides.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Please select at least one date to create a block booking
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}