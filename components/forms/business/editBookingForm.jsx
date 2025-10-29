"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostcodeInput } from "@/components/shared/PostcodeInput"; 
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditBookingForm({ booking, houses }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Pre-fill form with existing booking data
  const [formData, setFormData] = useState({
    pickupLocation: booking.pickupLocation || "",
    dropoffLocation: booking.dropoffLocation || "",
    pickupPostcode: "", // Will be set from booking if available
    dropoffPostcode: "", // Will be set from booking if available
    pickupDate: booking.pickupTime ? new Date(booking.pickupTime).toISOString().split('T')[0] : "",
    pickupTime: booking.pickupTime ? new Date(booking.pickupTime).toTimeString().slice(0, 5) : "",
    returnTime: booking.returnTime ? new Date(booking.returnTime).toTimeString().slice(0, 5) : "",
    passengerCount: booking.accessibilityProfile?.passengerCount?.toString() || "1",
    wheelchairUsers: booking.accessibilityProfile?.wheelchairUsers?.toString() || "0",
    
    // Accessibility options from profile
    wheelchairAccess: booking.accessibilityProfile?.wheelchairAccess || false,
    doubleWheelchairAccess: booking.accessibilityProfile?.doubleWheelchairAccess || false,
    highRoof: booking.accessibilityProfile?.highRoof || false,
    carerPresent: booking.accessibilityProfile?.carerPresent || false,
    femaleDriverOnly: booking.accessibilityProfile?.femaleDriverOnly || false,
    quietEnvironment: booking.accessibilityProfile?.quietEnvironment || false,
    assistanceRequired: booking.accessibilityProfile?.assistanceRequired || false,
    noConversation: booking.accessibilityProfile?.noConversation || false,
    visualSchedule: booking.accessibilityProfile?.visualSchedule || false,
    assistanceAnimal: booking.accessibilityProfile?.assistanceAnimal || false,
    familiarDriverOnly: booking.accessibilityProfile?.familiarDriverOnly || false,
    escortRequired: booking.accessibilityProfile?.escortRequired || false,
    signLanguageRequired: booking.accessibilityProfile?.signLanguageRequired || false,
    textOnlyCommunication: booking.accessibilityProfile?.textOnlyCommunication || false,
    medicationOnBoard: booking.accessibilityProfile?.medicationOnBoard || false,
    mobilityAidStorage: booking.accessibilityProfile?.mobilityAidStorage || false,
    electricScooterStorage: booking.accessibilityProfile?.electricScooterStorage || false,
    
    additionalNeeds: booking.accessibilityProfile?.additionalNeeds || "",
  });

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

    if (!formData.pickupDate || !formData.pickupTime) {
      toast.error("Please select pickup date and time");
      setSubmitting(false);
      return;
    }

    // Validation
    const passengerCount = parseInt(formData.passengerCount, 10) || 0;
    const wheelchairUsers = parseInt(formData.wheelchairUsers, 10) || 0;

    if (wheelchairUsers > passengerCount) {
      toast.error("Wheelchair users cannot exceed total passengers");
      setSubmitting(false);
      return;
    }

    // Check if booking is at least 48 hours in advance
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const now = new Date();
    const hoursDifference = (pickupDateTime - now) / (1000 * 60 * 60);

    if (hoursDifference < 48) {
      toast.error("Advanced bookings must be at least 48 hours in advance");
      setSubmitting(false);
      return;
    }

    try {
      toast.loading("Updating booking...");

      const returnTime = formData.returnTime
        ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
        : null;

      // Update booking
      const response = await fetch(`/api/bookings/advanced/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          pickupTime: pickupDateTime.toISOString(),
          returnTime: returnTime ? returnTime.toISOString() : null,
          
          // Accessibility profile updates
          accessibilityProfile: {
            passengerCount,
            wheelchairUsers,
            wheelchairAccess: formData.wheelchairAccess,
            doubleWheelchairAccess: formData.doubleWheelchairAccess,
            highRoof: formData.highRoof,
            carerPresent: formData.carerPresent,
            femaleDriverOnly: formData.femaleDriverOnly,
            quietEnvironment: formData.quietEnvironment,
            assistanceRequired: formData.assistanceRequired,
            noConversation: formData.noConversation,
            visualSchedule: formData.visualSchedule,
            assistanceAnimal: formData.assistanceAnimal,
            familiarDriverOnly: formData.familiarDriverOnly,
            escortRequired: formData.escortRequired,
            signLanguageRequired: formData.signLanguageRequired,
            textOnlyCommunication: formData.textOnlyCommunication,
            medicationOnBoard: formData.medicationOnBoard,
            mobilityAidStorage: formData.mobilityAidStorage,
            electricScooterStorage: formData.electricScooterStorage,
            additionalNeeds: formData.additionalNeeds,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update booking");
      }

      toast.dismiss();
      toast.success("Booking updated successfully!");
      
      setTimeout(() => {
        router.push(`/dashboard/manager/bookings/${booking.id}`);
      }, 1000);
    } catch (error) {
      toast.dismiss();
      console.error("Error updating booking:", error);
      toast.error(error.message || "Failed to update booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/manager/bookings/${booking.id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Booking
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Edit Booking</h2>
        <p className="text-gray-600 mt-2">
          Update booking details. Current bids will remain valid.
        </p>
      </div>

      {/* Warning if bids exist */}
      {booking.bids && booking.bids.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            ⚠️ This booking has {booking.bids.length} bid{booking.bids.length !== 1 ? 's' : ''}. 
            Significant changes may affect driver suitability.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Journey Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Journey Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupLocation" className="block font-medium text-gray-700 mb-1">
                Pickup Location *
              </label>
              <input
                id="pickupLocation"
                name="pickupLocation"
                type="text"
                required
                value={formData.pickupLocation}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="dropoffLocation" className="block font-medium text-gray-700 mb-1">
                Drop-off Location *
              </label>
              <input
                id="dropoffLocation"
                name="dropoffLocation"
                type="text"
                required
                value={formData.dropoffLocation}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupDate" className="block font-medium text-gray-700 mb-1">
                Pickup Date *
              </label>
              <input
                id="pickupDate"
                name="pickupDate"
                type="date"
                required
                value={formData.pickupDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="pickupTime" className="block font-medium text-gray-700 mb-1">
                Pickup Time *
              </label>
              <input
                id="pickupTime"
                name="pickupTime"
                type="time"
                required
                value={formData.pickupTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="returnTime" className="block font-medium text-gray-700 mb-1">
              Return Time (Optional)
            </label>
            <input
              id="returnTime"
              name="returnTime"
              type="time"
              value={formData.returnTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for one-way journey
            </p>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Passenger Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="passengerCount" className="block font-medium text-gray-700 mb-1">
                Total Passengers *
              </label>
              <input
                id="passengerCount"
                name="passengerCount"
                type="number"
                min="1"
                max="8"
                required
                value={formData.passengerCount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="wheelchairUsers" className="block font-medium text-gray-700 mb-1">
                Wheelchair Users
              </label>
              <input
                id="wheelchairUsers"
                name="wheelchairUsers"
                type="number"
                min="0"
                max="2"
                value={formData.wheelchairUsers}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>
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
            Additional Needs (Optional)
          </label>
          <textarea
            id="additionalNeeds"
            name="additionalNeeds"
            rows={3}
            value={formData.additionalNeeds}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Any other requirements or information..."
            disabled={submitting}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/manager/bookings/${booking.id}`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}