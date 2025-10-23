//components/forms/business/managerBookRideForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { createManagerBooking } from "@/app/actions/bookings/createManagerBooking";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import PhysicalRequirementsCheckboxes from "../driver/PhysicalRequirementsCheckBoxes";
import StatusMessage from "@/components/shared/statusMessage";
import { ArrowLeft, Timer } from "lucide-react";

const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}|GIR 0AA)$/i;

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
          // ... map all accessibility fields
          
          additionalNeeds: data.additionalNeeds || "",
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

     if (!formData.pickupDate || !formData.pickupTime) {
      alert("Please select pickup date and time");
      return;
    }

    // Validation
    const passengerCount = parseInt(formData.passengerCount, 10) || 0;
    const wheelchairUsers = parseInt(formData.wheelchairUsers, 10) || 0;

    if (wheelchairUsers > passengerCount) {
      setStatus("❌ Wheelchair users cannot exceed total passengers.");
      errorRef.current?.focus();
      return;
    }

    if (!formData.houseId || !formData.residentId) {
      setStatus("❌ Please select a house and resident.");
      errorRef.current?.focus();
      return;
    }

    if (!postcodeRegex.test(formData.pickupPostcode)) {
      setStatus("❌ Invalid pickup postcode format");
      errorRef.current?.focus();
      return;
    }

    if (!postcodeRegex.test(formData.dropoffPostcode)) {
      setStatus("❌ Invalid dropoff postcode format");
      errorRef.current?.focus();
      return;
    }

    if (!formData.pickupDate || !formData.pickupTime) {
      setStatus("❌ Pickup date and time are required.");
      errorRef.current?.focus();
      return;
    }

    // Check if booking is at least 48 hours in advance
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const now = new Date();
    const hoursDifference = (pickupDateTime - now) / (1000 * 60 * 60);

    if (hoursDifference < 48) {
      setStatus("❌ Advanced bookings must be at least 48 hours in advance.");
      errorRef.current?.focus();
      return;
    }

    const returnTime = formData.returnTime
      ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
      : null;

    try {
      const res = await createManagerBooking({
        ...formData,
        passengerCount,
        wheelchairUsers,
        pickupTime: pickupDateTime,
        returnTime,
      });

      if (res.success) {
        setStatus("✅ Booking created! Drivers can now bid.");
        setTimeout(() => {
          router.push(`/dashboard/manager/bookings/${res.bookingId}`);
        }, 1500);
      } else {
        setStatus("❌ Failed: " + res.error);
        errorRef.current?.focus();
      }
    } catch (err) {
      console.error("💥 Error:", err);
      setStatus("❌ Something went wrong.");
      errorRef.current?.focus();
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
            <span className="font-medium">Pre-Scheduled Booking</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Create Advanced Booking</h1>
          <p className="text-gray-600 mt-2">
            Schedule a ride at least 48 hours in advance - drivers will bid on this booking
          </p>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />
        {isRepeating && (
  <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 className="font-semibold text-blue-900 mb-1">
          🔄 Repeating Previous Trip
        </h3>
        <p className="text-sm text-blue-800">
          Trip details have been pre-filled. Please select a new date and time below.
        </p>
      </div>
    </div>
  </div>
)}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-6"
        >
          <div ref={errorRef} tabIndex={-1} />

          {/* House & Resident Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">
              1. Select House & Resident
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
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
                  <option value="">-- Choose House --</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.name} ({house.residents.length} residents)
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choose Resident --</option>
                  {selectedHouse?.residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name}
                    </option>
                  ))}
                </select>
                {!selectedHouse && (
                  <p className="text-sm text-gray-500 mt-1">Select a house first</p>
                )}
              </div>
            </div>
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full pickup address"
                />
              </div>

              <div>
                <label htmlFor="pickupPostcode" className="block font-medium text-gray-700 mb-1">
                  Pickup Postcode *
                </label>
                <input
                  type="text"
                  id="pickupPostcode"
                  name="pickupPostcode"
                  required
                  value={formData.pickupPostcode}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. SW1A 1AA"
                />
              </div>

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

              <div>
                <label htmlFor="dropoffPostcode" className="block font-medium text-gray-700 mb-1">
                  Destination Postcode *
                </label>
                <input
                  type="text"
                  id="dropoffPostcode"
                  name="dropoffPostcode"
                  required
                  value={formData.dropoffPostcode}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. EC1A 1BB"
                />
              </div>
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
  aria-required="true"
  value={formData.pickupDate || ""}
  onChange={handleChange}
  className={`w-full mt-1 p-2 border-2 rounded text-gray-500 bg-white focus:ring focus:ring-blue-500 ${
    isRepeating && !formData.pickupDate
      ? "border-orange-400 bg-orange-50"
      : "border-gray-300"
  }`}
/>
                <p className="text-sm text-gray-500 mt-1">Must be 48+ hours ahead</p>
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
  value={formData.pickupTime || ""}
  onChange={handleChange}
  className={`w-full mt-1 p-2 border-2 rounded text-gray-500 bg-white focus:ring focus:ring-blue-500 ${
    isRepeating && !formData.pickupTime
      ? "border-orange-400 bg-orange-50"
      : "border-gray-300"
  }`}
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
                className="w-4 h-4 text-blue-600"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">
              4. Accessibility & Requirements
            </h2>
            <RideAccessibilityOptions formData={formData} setFormData={setFormData} prefix="manager-" />
            <PhysicalRequirementsCheckboxes formData={formData} setFormData={setFormData} />
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating Booking..." : "Create Booking & Open for Bids"}
          </Button>
        </form>
      </div>
    </div>
  );
}