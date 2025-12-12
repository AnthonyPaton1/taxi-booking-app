"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPublicBooking } from "@/app/actions/bookings/createPublicBooking";
import RideAccessibilityOptions from "./RideAccessibilityOptions";
import StatusMessage from "../shared/statusMessage";
import AddressAutocomplete from "../AddressAutoComplete";
import { toast } from "sonner";

const defaultFormData = {
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

  // Accessibility booleans
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
};

const JourneyBookingForm = () => {
  const [isRepeating, setIsRepeating] = useState(false);
  const searchParams = useSearchParams();
  const repeatTripId = searchParams.get("repeat");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState(defaultFormData);
  const errorRef = useRef(null);
  const [pickupAddressData, setPickupAddressData] = useState(null);
  const [dropoffAddressData, setDropoffAddressData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Fixed: Added closing brace
  const handlePickupPlaceSelected = (addressData) => {
    console.log('Pickup place selected:', addressData);
    setPickupAddressData(addressData);
    
    // Auto-populate the form fields
    setFormData(prev => ({
      ...prev,
      pickupLocation: addressData.formattedAddress,
      pickupPostcode: addressData.postcode || prev.pickupPostcode,
    }));
  };

  const handleDropoffPlaceSelected = (addressData) => {
    console.log('Dropoff place selected:', addressData);
    setDropoffAddressData(addressData);
    
    // Auto-populate the form fields
    setFormData(prev => ({
      ...prev,
      dropoffLocation: addressData.formattedAddress,
      dropoffPostcode: addressData.postcode || prev.dropoffPostcode,
    }));
  };

  useEffect(() => {
    if (status && errorRef.current) {
      errorRef.current.focus();
    }
  }, [status]);

  // ✅ Fixed: Removed addressData references
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
            walkingAid: data.walkingAid || false,
            hearingImpairment: data.hearingImpairment || false,
            visualImpairment: data.visualImpairment || false,
            cognitiveSupport: data.cognitiveSupport || false,
            mobilityScooter: data.mobilityScooter || false,
            oxygenRequired: data.oxygenRequired || false,
            serviceAnimal: data.serviceAnimal || false,
            
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setSubmitting(true);

    if (!formData.pickupDate || !formData.pickupTime) {
      setStatus("❌ Please select pickup date and time");
      toast.error("Please select pickup date and time");
      setSubmitting(false);
      return;
    }

    const passengerCount = parseInt(formData.passengerCount, 10) || 0;
    const wheelchairUsers = parseInt(formData.wheelchairUsers, 10) || 0;

    if (wheelchairUsers > passengerCount) {
      setStatus("❌ Wheelchair users cannot exceed total passengers.");
      toast.error("Wheelchair users cannot exceed total passengers");
      errorRef.current?.focus();
      setSubmitting(false);
      return;
    }

    // Validate dates/times
    const pickupTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const returnTime = formData.returnTime
      ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
      : null;

    if (isNaN(pickupTime.getTime())) {
      setStatus("❌ Invalid pickup time format.");
      toast.error("Invalid pickup time format");
      setSubmitting(false);
      return;
    }

    try {
      let pickupCoords, dropoffCoords;

      // ✅ Use cached Google coordinates if available
      if (pickupAddressData && pickupAddressData.latitude) {
        toast.loading("Using pickup location...");
        pickupCoords = {
          postcode: pickupAddressData.postcode || formData.pickupPostcode,
          lat: pickupAddressData.latitude,
          lng: pickupAddressData.longitude,
        };
      } else {
        // Fall back to postcode validation
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
            const pickupField = document.getElementById("pickupPostcode");
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

        pickupCoords = pickupData.coordinates;
      }

      toast.dismiss();

      // Same for dropoff
      if (dropoffAddressData && dropoffAddressData.latitude) {
        toast.loading("Using dropoff location...");
        dropoffCoords = {
          postcode: dropoffAddressData.postcode || formData.dropoffPostcode,
          lat: dropoffAddressData.latitude,
          lng: dropoffAddressData.longitude,
        };
      } else {
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
            const dropoffField = document.getElementById("dropoffPostcode");
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

        dropoffCoords = dropoffData.coordinates;
      }

      toast.dismiss();
      toast.loading("Submitting booking...");

      // ✅ Simplified - just "BOOKING"
      const bookingPayload = {
        ...formData,
        pickupPostcode: pickupCoords.postcode,
        dropoffPostcode: dropoffCoords.postcode,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        passengerCount,
        wheelchairUsers,
        pickupTime,
        returnTime,
      };

      const res = await createPublicBooking(bookingPayload);

      if (res.success) {
        toast.dismiss();
        toast.success("Booking submitted successfully!");
        setStatus("✅ Booking submitted successfully!");
        router.push("/dashboard/public?success=true"); 
        setFormData(defaultFormData);
        setPickupAddressData(null);
        setDropoffAddressData(null);
      } else {
        toast.dismiss();
        toast.error(res.error || "Failed to submit booking");
        setStatus("❌ Failed to submit booking: " + res.error);
        errorRef.current?.focus();
      }
    } catch (err) {
      toast.dismiss();
      console.error("💥 Error submitting booking:", err);
      toast.error("Something went wrong. Please try again.");
      setStatus("❌ Something went wrong, check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
<StatusMessage message={status} type={status?.startsWith("❌") ? "error" : "info"} />
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
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
        aria-labelledby="public-booking-form"
      >
        <h2
          id="public-booking-form"
          className="text-xl font-bold text-blue-800"
        >
          Book a Journey
        </h2>

 {/* Pickup Location */}
<AddressAutocomplete
  label="Pickup Location"
  value={formData.pickupLocation}
  onChange={(value) => setFormData(prev => ({ ...prev, pickupLocation: value }))}
  onPlaceSelected={handlePickupPlaceSelected}
  placeholder="Enter address or place name (e.g., Stepping Hill Hospital)"
  required
/>

{/* Pickup Postcode - can still be manually entered */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Pickup Postcode <span className="text-red-500">*</span>
  </label>
  <input
    id="pickupPostcode"
    type="text"
    name="pickupPostcode"
    value={formData.pickupPostcode}
    onChange={handleChange}
    placeholder="e.g., SK2 7JE"
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  />
  <p className="mt-1 text-xs text-gray-500">
    {pickupAddressData?.postcode ? 
      `✓ Auto-filled from address: ${pickupAddressData.postcode}` : 
      'Or enter manually'}
  </p>
</div>

{/* Dropoff Location */}
<AddressAutocomplete
  label="Dropoff Location"
  value={formData.dropoffLocation}
  onChange={(value) => setFormData(prev => ({ ...prev, dropoffLocation: value }))}
  onPlaceSelected={handleDropoffPlaceSelected}
  placeholder="Enter address or place name"
  required
/>

{/* Dropoff Postcode */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Dropoff Postcode <span className="text-red-500">*</span>
  </label>
  <input
    id="dropoffPostcode"
    type="text"
    name="dropoffPostcode"
    value={formData.dropoffPostcode}
    onChange={handleChange}
    placeholder="e.g., M1 1AE"
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  />
  <p className="mt-1 text-xs text-gray-500">
    {dropoffAddressData?.postcode ? 
      `✓ Auto-filled from address: ${dropoffAddressData.postcode}` : 
      'Or enter manually'}
  </p>
</div>

        
        

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickupDate" className="block font-medium text-gray-700">
              Journey Date
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
          </div>
          <div>
            <label htmlFor="pickupTime" className="block font-medium text-gray-700">
              Pickup Time
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

        {/* Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="passengerCount" className="block font-medium text-gray-700">
              Number of Passengers (excl wheelchairs)
            </label>
            <input
  type="number"
  id="passengerCount"
  name="passengerCount"
  min={1}
  max={15}
  aria-required="true"
  aria-describedby="passengerHelp"
  value={formData.passengerCount === "" ? "" : formData.passengerCount}
  onChange={(e) => {
    const val = e.target.value;
    setFormData((p) => ({
      ...p,
      passengerCount: val === "" ? "" : Math.max(1, parseInt(val, 10) || 1),
    }));
  }}
  className="w-full mt-1 p-2 border rounded focus:ring text-gray-500 focus:ring-blue-500"
/>
            <p id="passengerHelp" className="text-sm text-gray-500">Maximum 15 passengers</p>
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
  aria-required="true"
  aria-describedby="wheelchairHelp"
  value={formData.wheelchairUsers === "" ? "" : formData.wheelchairUsers}
  onChange={(e) => {
    const val = e.target.value;
    setFormData((p) => ({
      ...p,
      wheelchairUsers: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0),
    }));
  }}
  className={`w-full mt-1 p-2 border text-gray-500 rounded focus:ring focus:ring-blue-500 ${
    formData.wheelchairUsers > (formData.passengerCount || 0)
      ? "border-red-500"
      : "border-gray-300"
  }`}
/>
            <p id="wheelchairHelp" className="text-sm text-gray-500">Maximum 6 wheelchair users</p>
            {formData.wheelchairUsers > (formData.passengerCount || 0) && (
              <p className="text-sm text-red-600  mt-1" role="alert" aria-live="assertive">
                Wheelchair users cannot exceed total passengers.
              </p>
            )}
          </div>
        </div>

        {/* Round Trip */}
        <div className="flex items-center mt-2">
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
              className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            />
          </div>
        )}

        {/* Extra accessibility + needs */}
<RideAccessibilityOptions formData={formData} setFormData={setFormData} prefix="public-" />

<div>
  <label htmlFor="additionalNeeds" className="block font-medium text-gray-700">
    Additional Needs (Optional)
  </label>
  <textarea
    id="additionalNeeds"
    name="additionalNeeds"
    rows={3}
    aria-describedby="additionalHelp"
    aria-required="false"
    placeholder="Any special requests not listed above..."
    value={formData.additionalNeeds}
    onChange={handleChange}
    className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
  />
  <p id="additionalHelp" className="text-sm text-gray-500">
    e.g. medication, carer instructions
  </p>
</div>

<Button
  type="submit"
  className="w-full bg-blue-700 text-white flex items-center justify-center"
  disabled={status === "loading"}
  aria-busy={status === "loading"}
>
  {status === "loading" ? (
    <>
      <svg
        className="animate-spin h-5 w-5 mr-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Submitting...
    </>
  ) : (
    "Submit Booking"
  )}
</Button>
</form>
    </>
  );
};

export default JourneyBookingForm;