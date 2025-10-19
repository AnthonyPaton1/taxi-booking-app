// components/manager/ManagerBookRideForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createManagerBooking } from "@/app/actions/bookings/createManagerBooking";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import PhysicalRequirementsCheckboxes from "../driver/PhysicalRequirementsCheckBoxes";
import StatusMessage from "@/components/shared/statusMessage";

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
    <>
      <StatusMessage
        message={status}
        type={status?.startsWith("❌") ? "error" : "info"}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-xl font-bold text-blue-800">
          Advanced Booking Details
        </h2>

        {/* House & Resident Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <label htmlFor="houseId" className="block font-medium text-gray-700">
              Select House *
            </label>
            <select
              id="houseId"
              name="houseId"
              required
              value={formData.houseId}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
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
            <label htmlFor="residentId" className="block font-medium text-gray-700">
              Select Resident *
            </label>
            <select
              id="residentId"
              name="residentId"
              required
              value={formData.residentId}
              onChange={handleChange}
              disabled={!selectedHouse}
              className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500 disabled:bg-gray-100"
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

        {/* Pickup Location */}
        <div>
          <label htmlFor="pickupLocation" className="block font-medium text-gray-700">
            Pickup Address *
          </label>
          <input
            type="text"
            id="pickupLocation"
            name="pickupLocation"
            required
            value={formData.pickupLocation}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="Full pickup address"
          />
        </div>

        <div>
          <label htmlFor="pickupPostcode" className="block font-medium text-gray-700">
            Pickup Postcode *
          </label>
          <input
            type="text"
            id="pickupPostcode"
            name="pickupPostcode"
            required
            value={formData.pickupPostcode}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="e.g. SW1A 1AA"
          />
        </div>

        {/* Dropoff Location */}
        <div>
          <label htmlFor="dropoffLocation" className="block font-medium text-gray-700">
            Destination Address *
          </label>
          <input
            type="text"
            id="dropoffLocation"
            name="dropoffLocation"
            required
            value={formData.dropoffLocation}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="Full destination address"
          />
        </div>

        <div>
          <label htmlFor="dropoffPostcode" className="block font-medium text-gray-700">
            Destination Postcode *
          </label>
          <input
            type="text"
            id="dropoffPostcode"
            name="dropoffPostcode"
            required
            value={formData.dropoffPostcode}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="e.g. EC1A 1BB"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickupDate" className="block font-medium text-gray-700">
              Journey Date *
            </label>
            <input
              type="date"
              id="pickupDate"
              name="pickupDate"
              required
              value={formData.pickupDate}
              onChange={handleChange}
              min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0]}
              className="w-full mt-1 p-2 border rounded text-gray-500 bg-white focus:ring focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Must be 48+ hours ahead</p>
          </div>

          <div>
            <label htmlFor="pickupTime" className="block font-medium text-gray-700">
              Pickup Time *
            </label>
            <input
              type="time"
              id="pickupTime"
              name="pickupTime"
              required
              value={formData.pickupTime}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded text-gray-500 bg-white focus:ring focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="passengerCount" className="block font-medium text-gray-700">
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
              className="w-full mt-1 p-2 border rounded text-gray-500 focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="wheelchairUsers" className="block font-medium text-gray-700">
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
              className="w-full mt-1 p-2 border rounded text-gray-500 focus:ring focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Round Trip */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="roundTrip"
            name="roundTrip"
            checked={formData.roundTrip}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="roundTrip" className="text-gray-700 font-medium">
            Return Journey?
          </label>
        </div>

        {formData.roundTrip && (
          <div>
            <label htmlFor="returnTime" className="block font-medium text-gray-700">
              Return Time
            </label>
            <input
              type="time"
              id="returnTime"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded text-gray-500 bg-white focus:ring focus:ring-blue-500"
            />
          </div>
        )}

        {/* Accessibility Options */}
        <RideAccessibilityOptions formData={formData} setFormData={setFormData} />
        <PhysicalRequirementsCheckboxes formData={formData} setFormData={setFormData} />

        {/* Additional Needs */}
        <div>
          <label htmlFor="additionalNeeds" className="block font-medium text-gray-700">
            Additional Needs (Visible to drivers)
          </label>
          <textarea
            id="additionalNeeds"
            name="additionalNeeds"
            rows={3}
            value={formData.additionalNeeds}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="Special requirements for drivers..."
          />
        </div>

        {/* Manager Notes (Internal Only) */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <label htmlFor="managerNotes" className="block font-medium text-gray-700">
            Internal Manager Notes (Not visible to drivers)
          </label>
          <textarea
            id="managerNotes"
            name="managerNotes"
            rows={2}
            value={formData.managerNotes}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="Internal notes, CQC requirements, etc..."
          />
          <p className="text-sm text-gray-600 mt-1">
            🔒 For internal use only - drivers cannot see this
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-700 text-white"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Creating Booking..." : "Create Booking & Open for Bids"}
        </Button>
      </form>
    </>
  );
}