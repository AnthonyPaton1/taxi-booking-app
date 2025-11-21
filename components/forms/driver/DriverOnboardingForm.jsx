"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { completeDriverOnboarding } from "@/app/actions/driver/driverDetails";
import { DriverOnboardingSchema } from "@/lib/validators";
import { toast } from "sonner";

// Required fields
const requiredFields = [
  "name",
  "vehicleClass", // CHANGED: vehicleType -> vehicleClass
  "vehicleReg",
  "licenceNumber",
  "localPostcode",
  "radiusMiles",
  "phone",
];

const requiredBooleans = [
  "ukDrivingLicence",
  "localAuthorityRegistered",
  "dbsChecked",
  "publicLiabilityInsurance",
  "fullyCompInsurance",
  "healthCheckPassed",
  "englishProficiency",
];

const defaultFormData = {
  name: "",
  vehicleClass: "", // CHANGED: vehicleType -> vehicleClass
  vehicleReg: "",
  licenceNumber: "",
  localPostcode: "",
  radiusMiles: 5,
  phone: "",

  // Compliance
  ukDrivingLicence: false,
  localAuthorityRegistered: false,
  dbsChecked: false,
  publicLiabilityInsurance: false,
  fullyCompInsurance: false,
  healthCheckPassed: false,
  englishProficiency: false,
  dbsIssueDate: '',
  dbsUpdateServiceNumber: '',
  dbsUpdateServiceConsent: false,

  // Accessibility Options (aligned with Prisma)
  wheelchairAccess: false,
  doubleWheelchairAccess: false,
  highRoof: false,
  carerPresent: false,
  passengerCount: 0,
  wheelchairUsers: 0,
  nonWAVvehicle: false,
  femaleDriverOnly: false,
  quietEnvironment: false,
  assistanceRequired: false,
  noConversation: false,
  specificMusic: "",
  electricScooterStorage: false,
  visualSchedule: false,
  assistanceAnimal: false,
  familiarDriverOnly: false,
  ageOfPassenger: null,
  escortRequired: false,
  preferredLanguage: "",
  signLanguageRequired: false,
  textOnlyCommunication: false,
  medicalConditions: "",
  firstAidTrained: false,
  conditionAwareness: false,
  visualSchedule: false,
  medicationOnBoard: false,
  additionalNeeds: "",

  // Vehicle amenities
  amenities: [],
};

const amenityOptions = [
  "High roof",
  "Side step",
  "Hydraulic lift",
  "Large boot",
  "Oxygen tank space",
  "Electric scooter storage",
];

export default function DriverOnboardingForm({ onSubmit }) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [firstErrorKey, setFirstErrorKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (firstErrorKey) {
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [firstErrorKey]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required.";
      }
    });

    // Validate required booleans
    requiredBooleans.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This checkbox must be checked.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFirstErrorKey(Object.keys(newErrors)[0]);
      setIsSubmitting(false);
      return;
    }

    // Reset errors
    setErrors({});
    setFirstErrorKey(null);

    try {
      // Step 1: Validate postcode and get coordinates
      toast.loading("Verifying your postcode...");
      
      const postcodeValidation = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: formData.localPostcode }),
      });

      const postcodeData = await postcodeValidation.json();

      // Check BOTH response.ok AND data.valid
      if (!postcodeValidation.ok || !postcodeData.valid) {
        toast.dismiss();
        toast.error(postcodeData.error || "Postcode not found", {
          duration: 5000,
        });
        setErrors({ localPostcode: postcodeData.error });
        setFirstErrorKey("localPostcode");
        
        // Scroll to postcode field
        setTimeout(() => {
          const postcodeField = document.getElementById("localPostcode");
          if (postcodeField) {
            postcodeField.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            postcodeField.focus();
          }
        }, 100);
        
        setIsSubmitting(false);
        return;
      }

      toast.dismiss();
      toast.loading("Completing your registration...");

      // Step 2: Add coordinates to form data
      const payload = {
        ...formData,
        localPostcode: postcodeData.coordinates.postcode, // Normalized postcode
        baseLat: postcodeData.coordinates.lat,            // Cache coordinates
        baseLng: postcodeData.coordinates.lng,
      };

      // Step 3: Validate with schema
      const validatedPayload = DriverOnboardingSchema.parse(payload);

      // Step 4: Submit
      const res = await completeDriverOnboarding(validatedPayload);

      if (!res.success) {
  console.error("❌ Onboarding error:", res.error, res.details);
  toast.error(res.error);
} else {
  toast.success("Success!");
  router.push("/dashboard/driver");
}

      toast.dismiss();
      toast.success("Onboarding completed successfully!");
      
      setTimeout(() => {
        window.location.href = "/dashboard/driver";
      }, 1500);
      
    } catch (err) {
      toast.dismiss();
      console.error("Onboarding error:", err);
      toast.error(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-6 rounded-lg shadow-md space-y-6 max-w-3xl mx-auto mt-8 `}
      aria-labelledby="driver-onboarding-form"
    >
      <h2
        id="driver-onboarding-form"
        className="text-xl font-bold text-blue-800"
      >
        Driver Onboarding
      </h2>

      {/* Personal details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-700">
          Personal Information
        </legend>

        <div>
          <label htmlFor="name" className="block font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            aria-required="true"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* UPDATED: Vehicle Class dropdown with new categories */}
        <div>
          <label htmlFor="vehicleClass" className="block font-medium text-gray-700">
            Vehicle Class
          </label>
          <select
            id="vehicleClass"
            name="vehicleClass"
            required
            aria-required="true"
            value={formData.vehicleClass}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          >
            <option value="">Select vehicle class</option>
            <option value="STANDARD_CAR">Standard Car (4-5 seats, no wheelchair access)</option>
            <option value="LARGE_CAR">Large Car/Estate (5-7 seats, extra boot space)</option>
            <option value="SIDE_LOADING_WAV">Side-Loading WAV (1 wheelchair + passengers)</option>
            <option value="REAR_LOADING_WAV">Rear-Loading WAV (1 wheelchair + passengers)</option>
            <option value="DOUBLE_WAV">Double WAV (2 wheelchairs simultaneously)</option>
            <option value="MINIBUS_ACCESSIBLE">Accessible Minibus (8+ seats, 3+ wheelchairs )</option>
            <option value="MINIBUS_STANDARD">Standard Minibus (8+ seats, steps only, 0 wheelchairs)</option>
          </select>
          {errors.vehicleClass && <p className="text-red-600 text-sm mt-1">{errors.vehicleClass}</p>}
          <p className="text-sm text-gray-500 mt-1">
            Select the class that best describes your vehicle's capabilities
          </p>
        </div>

        <div>
          <label htmlFor="vehicleReg" className="block font-medium text-gray-700">
            Vehicle Reg Number
          </label>
          <input
            type="text"
            id="vehicleReg"
            name="vehicleReg"
            required
            aria-required="true"
            value={formData.vehicleReg}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          {errors.vehicleReg && <p className="text-red-600 text-sm mt-1">{errors.vehicleReg}</p>}
        </div>

        <div>
          <label htmlFor="licenceNumber" className="block font-medium text-gray-700">
            Registered Licence Number
          </label>
          <input
            type="text"
            id="licenceNumber"
            name="licenceNumber"
            required
            aria-required="true"
            value={formData.licenceNumber}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          {errors.licenceNumber && <p className="text-red-600 text-sm mt-1">{errors.licenceNumber}</p>}
        </div>

        <div>
          <PostcodeInput
            id="localPostcode"
            value={formData.localPostcode}
            onChange={(value) => setFormData(prev => ({ ...prev, localPostcode: value }))}
            label="Base Postcode"
            placeholder="e.g., SK3 0AA"
            required
            className="w-full"
          />
          {errors.localPostcode && (
            <p className="text-red-600 text-sm mt-1">{errors.localPostcode}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            This is where you'll be based. We'll match you with nearby bookings.
          </p>
        </div>

        <div>
          <label htmlFor="radiusMiles" className="block font-medium text-gray-700">
            Operating Radius (miles)
          </label>
          <input
            type="number"
            id="radiusMiles"
            name="radiusMiles"
            min={5}
            max={100}
            inputMode="numeric"
            value={formData.radiusMiles?.toString() || ""}
            onChange={(e) => {
              let val = e.target.value;
              
              // Remove leading zeros
              if (val.length > 1 && val.startsWith("0")) {
                val = val.replace(/^0+/, "");
              }
              
              // Convert cleaned value to number
              setFormData((prev) => ({
                ...prev,
                radiusMiles: Number(val),
              }));
            }}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          {errors.radiusMiles && (
            <p className="text-red-600 text-sm mt-1">{errors.radiusMiles}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Maximum distance you're willing to travel for pickups (5-100 miles)
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium text-gray-700">
            Contact Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            aria-required="true"
            value={formData.phone}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="e.g. 07123 456789"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>
      </fieldset>
     
      <div className="mb-6">
        <h4 className="text-md font-semibold text-blue-800 mb-6 bg-blue-50 p-3 rounded">
          To proceed, all compliance criteria below must be confirmed and selected as true.  
          These checks ensure your vehicle and professional status meet the safety and legal requirements for providing passenger support services.
        </h4>
      </div>

      {/* Compliance */}
      <fieldset
        className="border border-gray-200 p-4 rounded space-y-2"
        aria-labelledby="compliance-section"
      >
        <legend id="compliance-section" className="font-semibold text-gray-700">
          Compliance Requirements
        </legend>

        {[
          { name: "ukDrivingLicence", label: "I hold a full and clean UK driving licence" },
          { name: "localAuthorityRegistered", label: "Registered with local authority" },
          { name: "dbsChecked", label: "I hold a valid enhanced DBS certificate and am registered with the DBS Update Service" },
          { name: "publicLiabilityInsurance", label: "Public liability insurance" },
          { name: "fullyCompInsurance", label: "Fully comprehensive insurance" },
          { name: "healthCheckPassed", label: "Health check passed" },
          { name: "englishProficiency", label: "I can communicate effectively in English" },
        ].map((field) => (
          <div key={field.name} className="flex flex-col space-y-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={field.name}
                name={field.name}
                checked={formData[field.name]}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700">{field.label}</span>
            </label>
            {errors[field.name] && (
              <p className="text-red-600 text-sm">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">DBS Update Service</h3>
          <p className="text-sm text-gray-600">
            All drivers must subscribe to the DBS Update Service (£16/year).
            <a 
              href="https://www.gov.uk/dbs-update-service" 
              target="_blank"
              className="text-blue-600 hover:underline ml-1"
            >
              Learn more
            </a>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DBS Certificate Issue Date *
            </label>
            <input
              type="date"
              name="dbsIssueDate"
              value={formData.dbsIssueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DBS Update Service Number * (12 digits)
            </label>
            <input
              type="text"
              name="dbsUpdateServiceNumber"
              value={formData.dbsUpdateServiceNumber}
              onChange={handleChange}
              placeholder="000123456789"
              pattern="[0-9]{12}"
              maxLength={12}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this on your DBS Update Service confirmation
            </p>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              name="dbsUpdateServiceConsent"
              checked={formData.dbsUpdateServiceConsent}
              onChange={(e) => setFormData({...formData, dbsUpdateServiceConsent: e.target.checked})}
              required
              className="mt-1 mr-2"
            />
            <label className="text-sm text-gray-700">
              I consent to NEAT Transport checking my DBS status through the 
              DBS Update Service for ongoing compliance verification *
            </label>
          </div>
        </div>
      </fieldset>

      <div className='mb-6'>
        <h4 className="text-md font-semibold text-blue-800 mb-6 bg-blue-50 p-3 rounded">
          Please answer the questions below accurately.  
          This ensures the right journeys are matched to your vehicle's capabilities
        </h4>
      </div>

      {/* Amenities */}
      <fieldset
        className="border border-gray-200 p-4 rounded space-y-2"
        aria-labelledby="amenities-section"
      >
        <legend id="amenities-section" className="font-semibold text-gray-700">
          Vehicle Amenities
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {amenityOptions.map((a) => (
            <div key={a} className="flex items-center">
              <input
                type="checkbox"
                id={a}
                value={a}
                checked={formData.amenities.includes(a)}
                onChange={handleAmenityChange}
                className="mr-2"
              />
              <label htmlFor={a} className="text-gray-700">
                {a}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
  
      <fieldset
        className="space-y-4 mt-6"
        aria-labelledby="driver-accessibility-label"
      >
        <legend
          id="driver-accessibility-label"
          className="text-lg font-semibold text-blue-900"
        >
          Accessibility & Support Options
        </legend>

        {/* Mobility */}
        <fieldset
          className="border border-gray-200 p-4 rounded"
          aria-labelledby="driver-mobility-legend"
        >
          <legend
            id="driver-mobility-legend"
            className="text-md font-semibold text-gray-700 mb-2"
          >
            Mobility Support
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="wheelchairAccess"
                checked={formData.wheelchairAccess || false}
                onChange={handleChange}
                className="mr-2"
              />
              Wheelchair assistance offered
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="seatTransferHelp"
                checked={formData.seatTransferHelp || false}
                onChange={handleChange}
                className="mr-2"
              />
              Help with seat transfers
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="mobilityAidStorage"
                checked={formData.mobilityAidStorage || false}
                onChange={handleChange}
                className="mr-2"
              />
              Assistance storing mobility aids
            </label>
          </div>
        </fieldset>

        {/* Sensory */}
        <fieldset
          className="border border-gray-200 p-4 rounded"
          aria-labelledby="driver-sensory-legend"
        >
          <legend
            id="driver-sensory-legend"
            className="text-md font-semibold text-gray-700 mb-2"
          >
            Sensory Preferences
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="quietEnvironment"
                checked={formData.quietEnvironment || false}
                onChange={handleChange}
                className="mr-2"
              />
              Quiet ride / no conversation
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="noScents"
                checked={formData.noScents || false}
                onChange={handleChange}
                className="mr-2"
              />
              No perfume or strong scents
            </label>
            
            {/* Music preference as text input */}
            <div className="col-span-2">
              <label htmlFor="specificMusic" className="block text-sm font-medium text-gray-700 mb-1">
                Music Preferences (Optional)
              </label>
              <input
                type="text"
                id="specificMusic"
                name="specificMusic"
                value={formData.specificMusic || ""}
                onChange={handleChange}
                placeholder="e.g., Classical, No music, Passenger choice"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe what music options you can offer (or leave blank)
              </p>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="visualSchedule"
                checked={formData.visualSchedule || false}
                onChange={handleChange}
                className="mr-2"
              />
              Provide visual schedule
            </label>
          </div>
        </fieldset>

        {/* Communication */}
        <fieldset
          className="border border-gray-200 p-4 rounded"
          aria-labelledby="driver-comm-legend"
        >
          <legend
            id="driver-comm-legend"
            className="text-md font-semibold text-gray-700 mb-2"
          >
            Communication
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="signLanguageRequired"
                checked={formData.signLanguageRequired || false}
                onChange={handleChange}
                className="mr-2"
              />
              Sign language support
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="textOnlyCommunication"
                checked={formData.textOnlyCommunication || false}
                onChange={handleChange}
                className="mr-2"
              />
              Text-only communication
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="translationSupport"
                checked={formData.translationSupport || false}
                onChange={handleChange}
                className="mr-2"
              />
              Translation support available
            </label>
          </div>
        </fieldset>

        {/* Safety & Health */}
        <fieldset
          className="border border-gray-200 p-4 rounded"
          aria-labelledby="driver-safety-legend"
        >
          <legend
            id="driver-safety-legend"
            className="text-md font-semibold text-gray-700 mb-2"
          >
            Safety & Health
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="firstAidTrained"
                checked={formData.firstAidTrained || false}
                onChange={handleChange}
                className="mr-2"
              />
              First Aid trained
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="medicationOnBoard"
                checked={formData.medicationOnBoard || false}
                onChange={handleChange}
                className="mr-2"
              />
              Can carry/store medication safely
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="conditionAwareness"
                checked={formData.conditionAwareness || false}
                onChange={handleChange}
                className="mr-2"
              />
              Experience with autism / dementia
            </label>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 p-4 rounded" aria-labelledby="female-only-legend">
          <legend id="female-only-legend" className="text-md font-semibold text-gray-700 mb-2">
            Additional Preferences
          </legend>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="femaleDriverOnly"
              checked={formData.femaleDriverOnly || false}
              onChange={handleChange}
              className="mr-2"
            />
            This vehicle is driven by female drivers only
          </label>
        </fieldset>
      </fieldset>

      <Button
        type="submit"
        className="w-full bg-blue-700 text-white"
        aria-label="Submit driver onboarding form"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}

