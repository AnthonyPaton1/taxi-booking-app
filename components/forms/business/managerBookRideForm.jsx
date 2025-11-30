//components/forms/business/managerBookRideForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { useSearchParams } from "next/navigation";
import { createManagerBooking } from "@/app/actions/bookings/createManagerBooking";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import LocationAutocomplete from "@/components/shared/LocationAutocomplete";
import { ArrowLeft, Timer, Accessibility } from "lucide-react";
import { toast } from "sonner";
import BlockBookingSection from "@/components/dashboard/business/manager/blockBookingsSection";

const defaultFormData = {
  houseId: "",
  residentIds: [],
  pickupFromHouse: false,
  pickupLocation: "",
  dropoffLocation: "",
  pickupPostcode: "",
  dropoffPostcode: "",
  pickupDate: "",
  pickupTime: "",
  returnTime: "",
  roundTrip: false,
  passengerCount: "1",
  wheelchairUsers: "0",
  
  // UPDATED: More detailed wheelchair configuration
  wheelchairConfig: {
    count: 0,
    powerchairs: 0,
    manualChairs: 0,
    requiresDoubleWAV: false,
    mobilityScooters: 0,
    requiresRearLoading: false,
    requiresSideLoading: false,
  },
  
  // Accessibility
  wheelchairAccess: false,
  carerPresent: false,
  nonWAVvehicle: false,
  femaleDriverOnly: false,
  quietEnvironment: false,
  assistanceRequired: false,
  noConversation: false,
  visualSchedule: false,
  assistanceAnimal: false,
  familiarDriverOnly: false,
  escortRequired: false,
  signLanguageRequired: false,
  textOnlyCommunication: false,
  medicationOnBoard: false,
  
  additionalNeeds: "",
  managerNotes: "",
};

export default function ManagerBookRideForm({ houses }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const searchParams = useSearchParams();
  const repeatTripId = searchParams.get("repeat");
  const [isRepeating, setIsRepeating] = useState(false);
  const errorRef = useRef(null);
  const router = useRouter();
  const [isBlockBooking, setIsBlockBooking] = useState(false);
  const [blockRides, setBlockRides] = useState([]);
  const [blockNotes, setBlockNotes] = useState("");

  // Filter residents based on selected house
  useEffect(() => {
    if (formData.houseId) {
      const house = houses.find((h) => h.id === formData.houseId);
      setSelectedHouse(house);
      setFormData((prev) => ({ ...prev, residentIds: [] })); 
    } else {
      setSelectedHouse(null);
    }
  }, [formData.houseId, houses]);

  useEffect(() => {
    if (formData.residentIds.length > 0) {
      setFormData(prev => ({
        ...prev,
        passengerCount: Math.max(
          parseInt(prev.passengerCount) || 1,
          formData.residentIds.length
        ).toString()
      }));
    }
  }, [formData.residentIds]);

  useEffect(() => {
    if (repeatTripId) {
      const repeatData = sessionStorage.getItem("repeatBookingData");
      
      if (repeatData) {
        try {
          const data = JSON.parse(repeatData);
          
          setFormData(prev => ({
            ...prev,
            houseId: data.houseId || "",
            residentIds: data.residentIds || [],
            pickupLocation: data.pickupLocation || "",
            dropoffLocation: data.dropoffLocation || "",
            pickupPostcode: data.pickupPostcode || "",
            dropoffPostcode: data.dropoffPostcode || "",
            passengerCount: data.passengerCount?.toString() || "1",
            wheelchairUsers: data.wheelchairUsers?.toString() || "0",
            wheelchairConfig: data.wheelchairConfig || defaultFormData.wheelchairConfig,
            wheelchairAccess: data.wheelchairAccess || false,
            carerPresent: data.carerPresent || false,
            femaleDriverOnly: data.femaleDriverOnly || false,
            quietEnvironment: data.quietEnvironment || false,
            noConversation: data.noConversation || false,
            visualSchedule: data.visualSchedule || false,
            assistanceAnimal: data.assistanceAnimal || false,
            familiarDriverOnly: data.familiarDriverOnly || false,
            escortRequired: data.escortRequired || false,
            signLanguageRequired: data.signLanguageRequired || false,
            textOnlyCommunication: data.textOnlyCommunication || false,
            medicationOnBoard: data.medicationOnBoard || false,
            assistanceRequired: data.assistanceRequired || false,
            nonWAVvehicle: data.nonWAVvehicle || false,
            additionalNeeds: data.additionalNeeds || "",
            managerNotes: data.managerNotes || "",
            physicalRequirements: data.physicalRequirements || [],
          }));

          setIsRepeating(true);
          sessionStorage.removeItem("repeatBookingData");
        } catch (error) {
          console.error("Failed to parse repeat booking data:", error);
        }
      }
    }
  }, [repeatTripId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // UPDATED: Handler for wheelchair config changes
  const handleWheelchairConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      wheelchairConfig: {
        ...prev.wheelchairConfig,
        [field]: value
      }
    }));
  };

  // UPDATED: Auto-calculate total wheelchair users
  useEffect(() => {
    const total = 
      parseInt(formData.wheelchairConfig.powerchairs) + 
      parseInt(formData.wheelchairConfig.manualChairs) + 
      parseInt(formData.wheelchairConfig.mobilityScooters);
    
    setFormData(prev => ({
      ...prev,
      wheelchairUsers: total.toString(),
      wheelchairConfig: {
        ...prev.wheelchairConfig,
        count: total
      },
      wheelchairAccess: total > 0
    }));
  }, [
    formData.wheelchairConfig.powerchairs, 
    formData.wheelchairConfig.manualChairs,
    formData.wheelchairConfig.mobilityScooters
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.pickupDate || !formData.pickupTime) {
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }
    
    if (isBlockBooking && blockRides.length === 0) {
      toast.error("Please select at least one date for the block booking");
      setSubmitting(false);
      return;
    }

    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`);
    
    let returnDateTime = null;
    if (formData.roundTrip && formData.returnTime) {
      returnDateTime = new Date(`${formData.pickupDate}T${formData.returnTime}:00`);
    }
    
    const passengerCount = parseInt(formData.passengerCount, 10) || 0;
    const wheelchairUsers = parseInt(formData.wheelchairUsers, 10) || 0;

    if (wheelchairUsers > passengerCount) {
      toast.error("Wheelchair users cannot exceed total passengers");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    if (!formData.houseId || formData.residentIds.length === 0) {
      toast.error("Please select a house and at least one resident");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    const returnTime = formData.returnTime
      ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
      : null;

    try {
      toast.loading("Verifying pickup postcode...");
      
      const pickupValidation = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: formData.pickupPostcode }),
      });

      const pickupData = await pickupValidation.json();

      if (!pickupValidation.ok || !pickupData.valid) {
        toast.dismiss();
        toast.error(pickupData.error || "Pickup postcode not found", {
          duration: 5000,
        });
        
        setTimeout(() => {
          const pickupField = document.getElementById("manager-pickup-postcode");
          if (pickupField) {
            pickupField.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            pickupField.focus();
          }
        }, 100);
        
        setSubmitting(false);
        return;
      }

      toast.dismiss();
      toast.loading("Verifying dropoff postcode...");

      const dropoffValidation = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: formData.dropoffPostcode }),
      });

      const dropoffData = await dropoffValidation.json();

      if (!dropoffValidation.ok || !dropoffData.valid) {
        toast.dismiss();
        toast.error(dropoffData.error || "Dropoff postcode not found", {
          duration: 5000,
        });
        
        setTimeout(() => {
          const dropoffField = document.getElementById("manager-dropoff-postcode");
          if (dropoffField) {
            dropoffField.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            dropoffField.focus();
          }
        }, 100);
        
        setSubmitting(false);
        return;
      }

      toast.dismiss();
      toast.loading("Creating booking...");
      
      const bookingPayload = {
        ...formData,
        pickupPostcode: pickupData.coordinates.postcode,
        dropoffPostcode: dropoffData.coordinates.postcode,
        pickupLat: pickupData.coordinates.lat,
        pickupLng: pickupData.coordinates.lng,
        dropoffLat: dropoffData.coordinates.lat,
        dropoffLng: dropoffData.coordinates.lng,
        passengerCount,
        wheelchairUsers,
        pickupTime: pickupDateTime,
        returnTime,
        type: "ADVANCED", 
      };

      const res = await createManagerBooking(bookingPayload);

      if (res.success) {
        toast.dismiss();
        toast.success("Booking created! Drivers can now bid.");
        setTimeout(() => {
          router.push(`/dashboard/manager/bookings/${res.bookingId}`);
        }, 1500);
      } else {
        toast.dismiss();
        toast.error(res.error || "Failed to create booking");
        errorRef.current?.focus();
      }
    } catch (err) {
      toast.dismiss();
      console.error("💥 Error:", err);
      toast.error("Something went wrong. Please try again.");
      errorRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/manager"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-blue-600">
            <Timer className="w-5 h-5" />
            <span className="font-medium">Booking</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Book a Ride</h1>
          <p className="text-gray-600 mt-2">
            Create an advanced booking for a resident.
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-blue-700 bg-blue-50 p-3 rounded">
            <Timer className="w-4 h-4" />
            <span>The further in advance you create the booking the better chance of more bids reducing travel costs</span>
          </div>
        </div>

        <div ref={errorRef} tabIndex={-1}></div>

        {isRepeating && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✨ Repeating previous trip (dates cleared for new booking)
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">

          {/* House & Resident Selection */}
          <div>
            <label htmlFor="houseId" className="block font-medium text-gray-700 mb-2">
              Select House *
            </label>
            <select
              id="houseId"
              name="houseId"
              required
              value={formData.houseId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select a House --</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Residents Traveling * (Select all that apply)
            </label>
            
            {!selectedHouse ? (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded border border-gray-200">
                Please select a house first to see available residents
              </p>
            ) : selectedHouse.residents && selectedHouse.residents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {selectedHouse.residents.map((resident) => (
                  <label
                    key={resident.id}
                    className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                      formData.residentIds.includes(resident.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.residentIds.includes(resident.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            residentIds: [...prev.residentIds, resident.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            residentIds: prev.residentIds.filter(id => id !== resident.id)
                          }));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">
                        {resident.name}
                      </span>
                      {resident.initials && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({resident.initials})
                        </span>
                      )}
                    </div>
                    {formData.residentIds.includes(resident.id) && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded border border-gray-200">
                No residents found for this house
              </p>
            )}
            
            {formData.residentIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {formData.residentIds.length} resident{formData.residentIds.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
            <input
              type="checkbox"
              id="pickupFromHouse"
              checked={formData.pickupFromHouse}
              onChange={(e) => {
                if (e.target.checked && selectedHouse) {
                  setFormData(prev => ({
                    ...prev,
                    pickupFromHouse: true,
                    pickupLocation: `${selectedHouse.label}, ${selectedHouse.line1}`,
                    pickupPostcode: selectedHouse.postcode,
                    pickupLat: selectedHouse.lat,
                    pickupLng: selectedHouse.lng,
                  }));
                } else {
                  setFormData(prev => ({ ...prev, pickupFromHouse: false }));
                }
              }}
            />
            <label htmlFor="pickupFromHouse" className="text-sm font-medium cursor-pointer">
              Pick up from {selectedHouse?.label || 'selected house'}
            </label>
          </div>

          {/* PICKUP LOCATION - WITH SAVED LOCATIONS */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Pickup Location</h3>
            
            {/* Saved Locations Search - FIRST for better UX */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Saved Locations
              </label>
              <LocationAutocomplete
                value={formData.pickupLocation}
                onChange={(value) => setFormData(prev => ({ ...prev, pickupLocation: value }))}
                onLocationSelect={(location) => {
                  setFormData(prev => ({
                    ...prev,
                    pickupLocation: location.address,
                    pickupPostcode: location.postcode,
                  }));
                  toast.success(`Selected: ${location.name}`);
                }}
                placeholder="Start typing to search saved locations..."
                required={false}
              />
              <p className="text-xs text-gray-500 mt-1">
                Or enter details manually below
              </p>
            </div>

            {/* Manual Address Input */}
            <div>
              <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address *
              </label>
              <input
                id="pickupLocation"
                name="pickupLocation"
                type="text"
                required
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="123 Main Street, City"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <PostcodeInput
              id="manager-pickup-postcode"
              label="Pickup Postcode *"
              value={formData.pickupPostcode}
              onChange={(value) => setFormData(prev => ({ ...prev, pickupPostcode: value }))}
              required
            />
          </div>

          {/* DROPOFF LOCATION - WITH SAVED LOCATIONS */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Dropoff Location</h3>
            
            {/* Saved Locations Search - FIRST for better UX */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Saved Locations
              </label>
              <LocationAutocomplete
                value={formData.dropoffLocation}
                onChange={(value) => setFormData(prev => ({ ...prev, dropoffLocation: value }))}
                onLocationSelect={(location) => {
                  setFormData(prev => ({
                    ...prev,
                    dropoffLocation: location.address,
                    dropoffPostcode: location.postcode,
                  }));
                  toast.success(`Selected: ${location.name}`);
                }}
                placeholder="Start typing to search saved locations..."
                required={false}
              />
              <p className="text-xs text-gray-500 mt-1">
                Or enter details manually below
              </p>
            </div>

            {/* Manual Address Input */}
            <div>
              <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff Address *
              </label>
              <input
                id="dropoffLocation"
                name="dropoffLocation"
                type="text"
                required
                value={formData.dropoffLocation}
                onChange={handleChange}
                placeholder="456 High Street, Town"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <PostcodeInput
              id="manager-dropoff-postcode"
              label="Dropoff Postcode *"
              value={formData.dropoffPostcode}
              onChange={(value) => setFormData(prev => ({ ...prev, dropoffPostcode: value }))}
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupDate" className="block font-medium text-gray-700 mb-1">
                Pickup Date *
              </label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                required
                value={formData.pickupDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="pickupTime" className="block font-medium text-gray-700 mb-1">
                Pickup Time *
              </label>
              <input
                type="time"
                id="pickupTime"
                name="pickupTime"
                required
                value={formData.pickupTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Round Trip */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="roundTrip"
              name="roundTrip"
              checked={formData.roundTrip}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="roundTrip" className="font-medium text-gray-700">
              Round Trip (Return Journey)
            </label>
          </div>

          {/* Return Time (if round trip) */}
          {formData.roundTrip && (
            <div>
              <label htmlFor="returnTime" className="block font-medium text-gray-700 mb-1">
                Return Time
              </label>
              <input
                type="time"
                id="returnTime"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Passenger Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="passengerCount" className="block font-medium text-gray-700 mb-1">
                Total Number of Passengers *
              </label>
              <input
                type="number"
                id="passengerCount"
                name="passengerCount"
                min="1"
                max="16"
                required
                value={formData.passengerCount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* UPDATED: Detailed Wheelchair Configuration */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Accessibility className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Wheelchair & Mobility Aid Requirements</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="powerchairs" className="block text-sm font-medium text-gray-700 mb-1">
                    Powerchairs
                  </label>
                  <input
                    type="number"
                    id="powerchairs"
                    min="0"
                    max="4"
                    value={formData.wheelchairConfig.powerchairs}
                    onChange={(e) => handleWheelchairConfigChange('powerchairs', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Electric wheelchairs</p>
                </div>

                <div>
                  <label htmlFor="manualChairs" className="block text-sm font-medium text-gray-700 mb-1">
                    Manual Wheelchairs
                  </label>
                  <input
                    type="number"
                    id="manualChairs"
                    min="0"
                    max="4"
                    value={formData.wheelchairConfig.manualChairs}
                    onChange={(e) => handleWheelchairConfigChange('manualChairs', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Non-powered chairs</p>
                </div>

                <div>
                  <label htmlFor="mobilityScooters" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobility Scooters
                  </label>
                  <input
                    type="number"
                    id="mobilityScooters"
                    min="0"
                    max="2"
                    value={formData.wheelchairConfig.mobilityScooters}
                    onChange={(e) => handleWheelchairConfigChange('mobilityScooters', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Electric scooters</p>
                </div>
              </div>

              {/* Total Display */}
              {formData.wheelchairConfig.count > 0 && (
                <div className="bg-white rounded p-3 border border-blue-300">
                  <p className="text-sm font-medium text-gray-700">
                    Total mobility aids: <span className="text-blue-600 font-bold">{formData.wheelchairConfig.count}</span>
                  </p>
                </div>
              )}

              {/* Vehicle Preferences - Only show if wheelchairs selected */}
              {formData.wheelchairConfig.count > 0 && (
                <div className="space-y-3 pt-3 border-t border-blue-200">
                  <p className="text-sm font-medium text-gray-700">Vehicle Preferences:</p>
                  
                  {formData.wheelchairConfig.count >= 2 && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wheelchairConfig.requiresDoubleWAV}
                        onChange={(e) => handleWheelchairConfigChange('requiresDoubleWAV', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Requires Double WAV (minimum 2 wheelchairs simultaneously)</span>
                    </label>
                  )}
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.wheelchairConfig.requiresRearLoading}
                      onChange={(e) => {
                        handleWheelchairConfigChange('requiresRearLoading', e.target.checked);
                        if (e.target.checked) {
                          handleWheelchairConfigChange('requiresSideLoading', false);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Prefer Rear-Loading WAV</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.wheelchairConfig.requiresSideLoading}
                      onChange={(e) => {
                        handleWheelchairConfigChange('requiresSideLoading', e.target.checked);
                        if (e.target.checked) {
                          handleWheelchairConfigChange('requiresRearLoading', false);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Prefer Side-Loading WAV</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Accessibility Options */}
          <RideAccessibilityOptions
            formData={formData}
            setFormData={setFormData} 
            handleChange={handleChange}
          />

          {/* Additional Needs */}
          <div>
            <label htmlFor="additionalNeeds" className="block font-medium text-gray-700 mb-1">
              Additional Needs
            </label>
            <textarea
              id="additionalNeeds"
              name="additionalNeeds"
              rows="3"
              value={formData.additionalNeeds}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any additional requirements or notes..."
            />
          </div>

          {/* Manager Notes (Internal) */}
          <div>
            <label htmlFor="managerNotes" className="block font-medium text-gray-700 mb-1">
              Internal Notes (Not visible to driver)
            </label>
            <textarea
              id="managerNotes"
              name="managerNotes"
              rows="2"
              value={formData.managerNotes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Internal notes for your reference..."
            />
          </div>

          <BlockBookingSection
            isBlockBooking={isBlockBooking}
            setIsBlockBooking={setIsBlockBooking}
            blockRides={blockRides}
            setBlockRides={setBlockRides}
            blockNotes={blockNotes}
            setBlockNotes={setBlockNotes}
            roundTrip={formData.roundTrip}
          />
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : isBlockBooking 
              ? `Create Block Booking (${blockRides.length} rides)`
              : "Create  Booking"
            }
          </button>
        </form>
      </div>
    </div>
  );
}