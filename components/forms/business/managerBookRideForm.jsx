//components/forms/business/managerBookRideForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { useSearchParams } from "next/navigation";
import { createManagerBooking } from "@/app/actions/bookings/createManagerBooking";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import PhysicalRequirementsCheckboxes from "../driver/PhysicalRequirementsCheckBoxes";
import StatusMessage from "@/components/shared/statusMessage";
import { ArrowLeft, Timer } from "lucide-react";
import { toast } from "sonner";

const defaultFormData = {
  houseId: "",
  residentId: "",
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
  managerNotes: "", // Internal notes
  physicalRequirements: [],
};

export default function ManagerBookRideForm({ houses }) {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const searchParams = useSearchParams();
  const repeatTripId = searchParams.get("repeat");
  const [isRepeating, setIsRepeating] = useState(false);
  const errorRef = useRef(null);
  const router = useRouter();

  // Filter residents based on selected house
  useEffect(() => {
    if (formData.houseId) {
      const house = houses.find((h) => h.id === formData.houseId);
      setSelectedHouse(house);
      // Reset resident selection when house changes
      setFormData((prev) => ({ ...prev, residentId: "" }));
    } else {
      setSelectedHouse(null);
    }
  }, [formData.houseId, houses]);

  useEffect(() => {
    if (status && errorRef.current) {
      errorRef.current.focus();
    }
  }, [status]);

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
            residentId: data.residentId || "",
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
            // Date and time intentionally left blank!
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
    setStatus("loading");
    setSubmitting(true);

    if (!formData.pickupDate || !formData.pickupTime) {
      setStatus("❌ Please select pickup date and time");
      toast.error("Please select pickup date and time");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    // Validation
    const passengerCount = parseInt(formData.passengerCount, 10) || 0;
    const wheelchairUsers = parseInt(formData.wheelchairUsers, 10) || 0;

    if (wheelchairUsers > passengerCount) {
      setStatus("❌ Wheelchair users cannot exceed total passengers.");
      toast.error("Wheelchair users cannot exceed total passengers");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    if (!formData.houseId || !formData.residentId) {
      setStatus("❌ Please select a house and resident.");
      toast.error("Please select a house and resident");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    // Check if booking is at least 48 hours in advance
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const now = new Date();
    const hoursDifference = (pickupDateTime - now) / (1000 * 60 * 60);

    if (hoursDifference < 48) {
      setStatus("❌ Advanced bookings must be at least 48 hours in advance.");
      toast.error("Advanced bookings must be at least 48 hours in advance");
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
          const pickupField = document.getElementById("manager-pickup-postcode");
          if (pickupField) {
            pickupField.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            pickupField.focus();
          }
        }, 100);
        
        setStatus("❌ " + pickupData.error);
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
          const dropoffField = document.getElementById("manager-dropoff-postcode");
          if (dropoffField) {
            dropoffField.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            dropoffField.focus();
          }
        }, 100);
        
        setStatus("❌ " + dropoffData.error);
        setSubmitting(false);
        return;
      }

      toast.dismiss();
      toast.loading("Creating booking...");

      // Step 3: Create booking with validated postcodes and coordinates
      const bookingPayload = {
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
        pickupTime: pickupDateTime,
        returnTime,
        type: "ADVANCED", // Manager bookings are always ADVANCED (48h minimum)
      };

      const res = await createManagerBooking(bookingPayload);

      if (res.success) {
        toast.dismiss();
        toast.success("Booking created! Drivers can now bid.");
        setStatus("✅ Booking created! Drivers can now bid.");
        setTimeout(() => {
          router.push(`/dashboard/manager/bookings/${res.bookingId}`);
        }, 1500);
      } else {
        toast.dismiss();
        toast.error(res.error || "Failed to create booking");
        setStatus("❌ Failed: " + res.error);
        errorRef.current?.focus();
      }
    } catch (err) {
      toast.dismiss();
      console.error("💥 Error:", err);
      toast.error("Something went wrong. Please try again.");
      setStatus("❌ Something went wrong.");
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
            <span className="font-medium">Advanced Booking</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Book a Ride</h1>
          <p className="text-gray-600 mt-2">
            Create an advanced booking for a resident (minimum 48 hours in advance)
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-blue-700 bg-blue-50 p-3 rounded">
            <Timer className="w-4 h-4" />
            <span>All bookings must be made at least 48 hours in advance to allow drivers time to bid</span>
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
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">

          {/* House & Resident Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="houseId" className="block font-medium text-gray-700 mb-1">
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
                <option value="">-- Select House --</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="residentId" className="block font-medium text-gray-700 mb-1">
                Select Resident *
              </label>
              <select
                id="residentId"
                name="residentId"
                required
                value={formData.residentId}
                onChange={handleChange}
                disabled={!selectedHouse}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">-- Select Resident --</option>
                {selectedHouse?.residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name}
                  </option>
                ))}
              </select>
              {!selectedHouse && (
                <p className="text-xs text-gray-500 mt-1">
                  Please select a house first
                </p>
              )}
            </div>
          </div>

          {/* Pickup & Dropoff Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Journey Details</h3>
            
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full pickup address"
                />
              </div>

              {/* Pickup Postcode - UPDATED */}
              <PostcodeInput
                id="manager-pickup-postcode"
                value={formData.pickupPostcode}
                onChange={(value) => setFormData(prev => ({ ...prev, pickupPostcode: value }))}
                label="Pickup Postcode"
                placeholder="e.g., SK3 0AA"
                required
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full destination address"
                />
              </div>

              {/* Dropoff Postcode - UPDATED */}
              <PostcodeInput
                id="manager-dropoff-postcode"
                value={formData.dropoffPostcode}
                onChange={(value) => setFormData(prev => ({ ...prev, dropoffPostcode: value }))}
                label="Destination Postcode"
                placeholder="e.g., M1 1AA"
                required
              />
            </div>
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
                min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="passengerCount" className="block font-medium text-gray-700 mb-1">
                Number of Passengers *
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

            <div>
              <label htmlFor="wheelchairUsers" className="block font-medium text-gray-700 mb-1">
                Number of Wheelchair Users
              </label>
              <input
                type="number"
                id="wheelchairUsers"
                name="wheelchairUsers"
                min="0"
                max="8"
                value={formData.wheelchairUsers}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Accessibility Options */}
          <RideAccessibilityOptions
            formData={formData}
            handleChange={handleChange}
          />

          {/* Physical Requirements */}
          <PhysicalRequirementsCheckboxes
            formData={formData}
            setFormData={setFormData}
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
            disabled={submitting}
          >
            {submitting ? "Creating Booking..." : "Create Advanced Booking"}
          </Button>
        </form>
      </div>
    </div>
  );
}