//components/forms/business/instantBookingForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import { ArrowLeft, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

const defaultFormData = {
  houseId: "",
  residentIds: [],
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

  vehicleType: "either",
  
  // Accessibility
  wheelchairAccess: false,
  carerPresent: false,
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

export default function InstantBookingForm({ houses, userName }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const searchParams = useSearchParams();
  const repeatTripId = searchParams.get("repeat");
  const errorRef = useRef(null);
  const router = useRouter();

  // Set default date to today and time to now + 30 mins
  useEffect(() => {
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0];
    
    // Round up to next 30 min interval
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    
    const defaultTime = now.toTimeString().slice(0, 5);
    
    setFormData((prev) => ({
      ...prev,
      pickupDate: defaultDate,
      pickupTime: defaultTime,
    }));
  }, []);

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

  // Repeat trip functionality
  useEffect(() => {
    if (repeatTripId) {
      const repeatData = sessionStorage.getItem("repeatBookingData");
      
      if (repeatData) {
        try {
          const data = JSON.parse(repeatData);
          
          // Pre-fill everything EXCEPT date/time
          setFormData(prev => ({
            ...prev,
            houseId: data.houseId || "",
            residentIds: data.residentIds || [],
            pickupLocation: data.pickupLocation || "",
            dropoffLocation: data.dropoffLocation || "",
            pickupPostcode: data.pickupPostcode || "",
            dropoffPostcode: data.dropoffPostcode || "",
            
            // Map correctly!
            passengerCount: data.passengerCount?.toString() || "1",
            wheelchairUsers: data.wheelchairUsers?.toString() || "0",
            
            // Accessibility options
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
            // Date and time intentionally left blank - will be set by default time logic!
          }));

          setIsRepeating(true);
          
          // Clear from session storage
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
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



    if (!formData.pickupDate || !formData.pickupTime) {
      toast.error("Pickup date and time are required");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    // Check if pickup is not in the past
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const now = new Date();
    
    if (pickupDateTime < now) {
      toast.error("Pickup time cannot be in the past");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    // Check if pickup is within next 48 hours (instant booking window)
    const hoursDifference = (pickupDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDifference > 48) {
      toast.error("For bookings 48+ hours ahead, please use Advanced Booking");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    const returnTime = formData.returnTime
      ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
      : null;

    try {
      // Step 1: Validate pickup postcode
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
        
        // Scroll to pickup postcode field
        setTimeout(() => {
          const pickupField = document.getElementById("instant-pickup-postcode");
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

      // Step 2: Validate dropoff postcode
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
        
        // Scroll to dropoff postcode field
        setTimeout(() => {
          const dropoffField = document.getElementById("instant-dropoff-postcode");
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
      toast.loading("Creating instant booking...");

      // Step 3: Create instant booking with validated postcodes and coordinates
      const res = await fetch("/api/bookings/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Normalized postcodes
          pickupPostcode: pickupData.coordinates.postcode,
          dropoffPostcode: dropoffData.coordinates.postcode,
          // Cached coordinates
          pickupLat: pickupData.coordinates.lat,
          pickupLng: pickupData.coordinates.lng,
          dropoffLat: dropoffData.coordinates.lat,
          dropoffLng: dropoffData.coordinates.lng,
          // Parsed values
          passengerCount,
          wheelchairUsers,
          pickupTime: pickupDateTime.toISOString(),
          returnTime: returnTime?.toISOString(),
          createdBy: userName,
          type: "INSTANT",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.dismiss();
        toast.success("Instant booking created! Drivers are being notified.");
        setTimeout(() => {
          router.push("/dashboard/manager");
        }, 1500);
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to create booking");
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

  // Calculate min/max dates (today to 2 days from now)
  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0];

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
          <div className="flex items-center gap-2 text-purple-600">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Instant Booking</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Create Instant Booking</h1>
          <p className="text-gray-600 mt-2">
            Book immediate transport (within next 48 hours) - drivers will be notified instantly
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-purple-700 bg-purple-50 p-3 rounded">
            <Clock className="w-4 h-4" />
            <span>Instant bookings are available from now until 2 days ahead</span>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div ref={errorRef} tabIndex={-1}>
            <StatusMessage message={status} />
          </div>
        )}

        {isRepeating && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✨ Repeating previous trip (dates cleared for new booking)
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-8">
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
                // Add resident
                setFormData(prev => ({
                  ...prev,
                  residentIds: [...prev.residentIds, resident.id]
                }));
              } else {
                // Remove resident
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


          {/* Journey Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">
              2. Journey Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickupLocation" className="block font-medium text-gray-700 mb-1">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  required
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full pickup address"
                />
              </div>

              {/* Pickup Postcode - UPDATED */}
              <PostcodeInput
                id="instant-pickup-postcode"
                value={formData.pickupPostcode}
                onChange={(value) => setFormData(prev => ({ ...prev, pickupPostcode: value }))}
                label="Pickup Postcode"
                placeholder="e.g., SK3 0AA"
                required
                className="w-full"
              />

              <div>
                <label htmlFor="dropoffLocation" className="block font-medium text-gray-700 mb-1">
                  Destination Address *
                </label>
                <input
                  type="text"
                  id="dropoffLocation"
                  name="dropoffLocation"
                  required
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full destination address"
                />
              </div>

              {/* Dropoff Postcode - UPDATED */}
              <PostcodeInput
                id="instant-dropoff-postcode"
                value={formData.dropoffPostcode}
                onChange={(value) => setFormData(prev => ({ ...prev, dropoffPostcode: value }))}
                label="Destination Postcode"
                placeholder="e.g., M1 1AA"
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickupDate" className="block font-medium text-gray-700 mb-1">
                  Journey Date *
                </label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  required
                  value={formData.pickupDate}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Today to 2 days ahead</p>
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <input
                type="checkbox"
                id="roundTrip"
                name="roundTrip"
                checked={formData.roundTrip}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600"
              />
              <label htmlFor="roundTrip" className="text-gray-700 font-medium">
                Return Journey?
              </label>
            </div>

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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">
              3. Passenger Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passengerCount" className="block font-medium text-gray-700 mb-1">
                  Number of Passengers *
                </label>
                <input
                  type="number"
                  id="passengerCount"
                  name="passengerCount"
                  min={1}
                  max={15}
                  value={formData.passengerCount}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="wheelchairUsers" className="block font-medium text-gray-700 mb-1">
                  Wheelchair Users
                </label>
                <input
                  type="number"
                  id="wheelchairUsers"
                  name="wheelchairUsers"
                  min={0}
                  max={6}
                  value={formData.wheelchairUsers}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">
              4. Accessibility & Requirements
            </h2>
            <RideAccessibilityOptions formData={formData} handleChange={handleChange} />
            {/* <PhysicalRequirementsCheckboxes formData={formData} setFormData={setFormData} /> */}
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">
              5. Additional Information
            </h2>

            <div>
              <label htmlFor="additionalNeeds" className="block font-medium text-gray-700 mb-1">
                Additional Needs (Visible to drivers)
              </label>
              <textarea
                id="additionalNeeds"
                name="additionalNeeds"
                rows={3}
                value={formData.additionalNeeds}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Special requirements for drivers..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <label htmlFor="managerNotes" className="block font-medium text-gray-700 mb-1">
                Internal Manager Notes (Not visible to drivers)
              </label>
              <textarea
                id="managerNotes"
                name="managerNotes"
                rows={2}
                value={formData.managerNotes}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Internal notes, CQC requirements, etc..."
              />
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                🔒 For internal use only - drivers cannot see this
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-medium"
            disabled={submitting}
          >
            {submitting ? "Creating Instant Booking..." : "Create Instant Booking & Notify Drivers"}
          </Button>
        </form>
      </div>
    </div>
  );
}