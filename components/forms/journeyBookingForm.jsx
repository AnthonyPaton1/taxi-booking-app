//components/forms/journeyBookingForm
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPublicBooking } from "@/app/actions/bookings/createPublicBooking";
import RideAccessibilityOptions from "./RideAccessibilityOptions";
import PhysicalRequirementsCheckboxes from "./driver/PhysicalRequirementsCheckBoxes";
import StatusMessage from "../shared/statusMessage";



const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}|GIR 0AA)$/i;
const defaultFormData = {
  pickupLocation: "",
  dropoffLocation: "",
  pickupPostcode: "",
  dropoffPostcode: "",
  pickupDate: "",
  pickupTime: "",
  returnTime: "",
  roundTrip: false,

  
  passengerCount: "1",  // default 1 passenger
  wheelchairUsers: "0", // default 0 wheelchairs

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

  // Textarea
  additionalNeeds: "",

  // Vehicle requirements
  physicalRequirements: [],
};


const JourneyBookingForm
 = () => {
  const [isRepeating, setIsRepeating] = useState(false);
  const searchParams = useSearchParams();
  const repeatTripId = searchParams.get("repeat");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState(defaultFormData);
  const errorRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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


const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("loading");

   if (!formData.pickupDate || !formData.pickupTime) {
      alert("Please select pickup date and time");
      return;
    }

  // --- Parse numbers safely ---
  const passengerCount = parseInt(formData.passengerCount, 10) || 0;
  const wheelchairUsers = parseInt(formData.wheelchairUsers, 10) || 0;

  if (wheelchairUsers > passengerCount) {
    setStatus("❌ Wheelchair users cannot exceed total passengers.");
    errorRef.current?.focus();
    return;
  }

  // --- Validate postcodes ---
  if (!postcodeRegex.test(formData.pickupPostcode)) {
    setStatus("Invalid pickup postcode format");
    errorRef.current?.focus();
    return;
  }
  if (!postcodeRegex.test(formData.dropoffPostcode)) {
    setStatus("Invalid dropoff postcode format");
    errorRef.current?.focus();
    return;
  }

  // --- Validate dates/times ---
  if (!formData.pickupDate || !formData.pickupTime) {
    setStatus("Pickup date and time are required.");
    return;
  }

  const pickupTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
  const returnTime = formData.returnTime
    ? new Date(`${formData.pickupDate}T${formData.returnTime}`)
    : null;

  if (isNaN(pickupTime.getTime())) {
    setStatus("Invalid pickup time format.");
    return;
  }

  try {
    // --- Decide booking type ---
    const today = new Date().toISOString().split("T")[0];
    const bookingType = formData.pickupDate === today ? "INSTANT" : "ADVANCED";

    // --- Call server action with parsed values ---
    const res = await createPublicBooking({
      ...formData,
      passengerCount,
      wheelchairUsers,
      pickupTime,
      returnTime,
      type: bookingType,
    });

   if (res.success) {
  setStatus("✅ Booking submitted successfully!");
  router.push("/dashboard/public?success=true"); 
  setFormData(defaultFormData);
} else {
      setStatus("❌ Failed to submit booking: " + res.error);
      errorRef.current?.focus();
    }
  } catch (err) {
    console.error("💥 Error submitting booking:", err);
    setStatus("❌ Something went wrong, check console.");
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

        {/* Pickup */}
        <div>
          <label htmlFor="pickupLocation" className="block font-medium text-gray-700">
            Pickup Address
          </label>
          <input
            type="text"
            id="pickupLocation"
            name="pickupLocation"
            required
            aria-required="true"
            aria-describedby="pickupHelp"
            value={formData.pickupLocation}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          <p id="pickupHelp" className="text-sm text-gray-500">Where should we pick you up?</p>
        </div>
        
  <div>
  <label
    htmlFor="pickupPostcode"
    className="block font-medium text-gray-700"
  >
    Pickup Postcode
  </label>
  <input
    type="text"
    id="pickupPostcode"
    name="pickupPostcode"
    required
    aria-label="Pickup postcode"
    value={formData.pickupPostcode}
    onChange={handleChange}
    className="w-full mt-1 p-2 border text-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-500"
    placeholder="e.g. SW1A 1AA"
  />
</div>


        {/* Dropoff */}
        <div>
          <label htmlFor="dropoffLocation" className="block font-medium text-gray-700">
            Destination Address
          </label>
          <input
            type="text"
            id="dropoffLocation"
            name="dropoffLocation"
            required
            aria-required="true"
            aria-describedby="dropoffHelp"
            value={formData.dropoffLocation}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          <p id="dropoffHelp" className="text-sm text-gray-500">Where do you want to go?</p>
        </div>
<div>
  <label
    htmlFor="dropoffPostcode"
    className="block font-medium text-gray-700"
  >
    Destination Postcode
  </label>
  <input
    type="text"
    id="dropoffPostcode"
    name="dropoffPostcode"
    required
    aria-label="Dropoff postcode"
    value={formData.dropoffPostcode}
    onChange={handleChange}
    className="w-full mt-1 p-2 border  text-gray-500  rounded focus:outline-none focus:ring focus:ring-blue-500"
    placeholder="e.g. EC1A 1BB"
  />
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
<PhysicalRequirementsCheckboxes formData={formData} setFormData={setFormData} />

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