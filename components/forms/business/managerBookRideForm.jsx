//components/forms/business/managerBookRideForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { useSearchParams } from "next/navigation";
import { createManagerBooking } from "@/app/actions/bookings/createManagerBooking";
import RideAccessibilityOptions from "../RideAccessibilityOptions";
import StatusMessage from "@/components/shared/statusMessage";
import { ArrowLeft, Timer } from "lucide-react";
import { toast } from "sonner";
import BlockBookingSection from "@/components/dashboard/business/manager/blockBookingsSection";

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
    if (status && errorRef.current) {
      errorRef.current.focus();
    }
  }, [status]);

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
  
  if (isBlockBooking && blockRides.length === 0) {
    setStatus("❌ Please select at least one date for the block booking");
    toast.error("Please select at least one date for the block booking");
    setSubmitting(false);
    return;
  }

  //  Combine pickup date and time into DateTime
  const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`);
  
  // Handle return time if round trip
  let returnDateTime = null;
  if (formData.roundTrip && formData.returnTime) {
    returnDateTime = new Date(`${formData.pickupDate}T${formData.returnTime}:00`);
  }

  //  Build booking data from the ACTUAL form state, not defaults
  const bookingData = {
    // Location data
    pickupLocation: formData.pickupLocation,
    pickupPostcode: formData.pickupPostcode,
    dropoffLocation: formData.dropoffLocation,
    dropoffPostcode: formData.dropoffPostcode,
    
    // DateTime data
    pickupTime: pickupDateTime.toISOString(),
    returnTime: returnDateTime ? returnDateTime.toISOString() : null,
    roundTrip: formData.roundTrip,
    
    // Passenger data
    initials: formData.residentIds, // or however you're storing resident initials
    passengerCount: parseInt(formData.passengerCount),
    wheelchairUsers: parseInt(formData.wheelchairUsers),
    
    // Accessibility requirements
    wheelchairAccess: formData.wheelchairAccess,
    femaleDriverOnly: formData.femaleDriverOnly,
    carerPresent: formData.carerPresent,
    assistanceAnimal: formData.assistanceAnimal,
    nonWAVvehicle: formData.nonWAVvehicle,
    quietEnvironment: formData.quietEnvironment,
    assistanceRequired: formData.assistanceRequired,
    noConversation: formData.noConversation,
    visualSchedule: formData.visualSchedule,
    familiarDriverOnly: formData.familiarDriverOnly,
    escortRequired: formData.escortRequired,
    signLanguageRequired: formData.signLanguageRequired,
    textOnlyCommunication: formData.textOnlyCommunication,
    medicationOnBoard: formData.medicationOnBoard,
    
    // Notes
    additionalNeeds: formData.additionalNeeds || null,
    managerNotes: formData.managerNotes || null,
    
    // 🆕 Block booking data
    isBlockBooking: isBlockBooking,
    blockRides: isBlockBooking ? blockRides : null,
    totalRidesInBlock: isBlockBooking ? blockRides.length : 1,
    blockNotes: isBlockBooking ? blockNotes : null,
  };

  try {
    const res = await fetch("/api/bookings/advanced/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData), // ✅ Now sending actual form data
    });

    const data = await res.json();

    if (data.success) {
      setStatus("✅ " + data.message);
      toast.success(data.message);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard/manager/bookings");
      }, 1500);
    } else {
      setStatus("❌ Error: " + data.error);
      toast.error(data.error);
      setSubmitting(false);
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    setStatus("❌ Something went wrong");
    toast.error("Something went wrong creating the booking");
    setSubmitting(false);
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

    if (!formData.houseId || formData.residentIds.length === 0) {
  setStatus("❌ Please select a house and at least one resident.");
  toast.error("Please select a house and at least one resident");
  errorRef.current?.focus();
  setSubmitting(false);
  return;
}

    // Check if booking is at least 48 hours in advance
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
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                      >
                        {isBlockBooking 
                          ? `Create Block Booking (${blockRides.length} rides)`
                          : "Create Advanced Booking"
                        }
                      </button>


          
        </form>
      </div>
    </div>
  );
}