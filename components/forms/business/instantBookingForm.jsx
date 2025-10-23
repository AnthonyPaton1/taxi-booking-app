//components/forms/business/instantBookingForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import PhysicalRequirementsCheckboxes from "../driver/PhysicalRequirementsCheckBoxes";
import StatusMessage from "@/components/shared/statusMessage";
import { ArrowLeft, Zap, Clock } from "lucide-react";

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
  managerNotes: "",
  physicalRequirements: [],
};

export default function InstantBookingForm({ houses, userName }) {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedHouse, setSelectedHouse] = useState(null);
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

    // Check if pickup is not in the past
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const now = new Date();
    
    if (pickupDateTime < now) {
      setStatus("❌ Pickup time cannot be in the past.");
      errorRef.current?.focus();
      return;
    }

    // Check if pickup is within next 48 hours (instant booking window)
    const hoursDifference = (pickupDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDifference > 48) {
      setStatus("❌ For bookings 48+ hours ahead, please use Advanced Booking.");
      errorRef.current?.focus();
      return;
    }

    const returnTime = formData.returnTime
      ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
      : null;

    try {
      const res = await fetch("/api/bookings/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passengerCount,
          wheelchairUsers,
          pickupTime: pickupDateTime.toISOString(),
          returnTime: returnTime?.toISOString(),
          createdBy: userName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("✅ Instant booking created! Drivers are being notified.");
        setTimeout(() => {
          router.push(`/dashboard/manager/instant-bookings/${data.bookingId}`);
        }, 1500);
      } else {
        setStatus("❌ Failed: " + (data.error || "Unknown error"));
        errorRef.current?.focus();
      }
    } catch (err) {
      console.error("💥 Error:", err);
      setStatus("❌ Something went wrong.");
      errorRef.current?.focus();
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
            <span>For bookings 48+ hours ahead, use Advanced Booking with driver bidding</span>
          </div>
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Choose House --</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.label} ({house.residents.length} residents)
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <RideAccessibilityOptions formData={formData} setFormData={setFormData} prefix="instant-" />
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
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating Instant Booking..." : "Create Instant Booking & Notify Drivers"}
          </Button>
        </form>
      </div>
    </div>
  );
}