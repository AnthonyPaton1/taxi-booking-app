"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { completeDriverOnboarding } from "@/app/actions/driver/driverOnboarding";

// Required fields
const requiredFields = [
  "name",
  "vehicleType",
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
  vehicleType: "",
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

  // Accessibility options
  wheelchairAssistance: false,
  seatTransferHelp: false,
  mobilityAidStorage: false,
  quietRide: false,
  noScents: false,
  specificMusic: false,
  visualSchedule: false,
  signLanguage: false,
  textOnlyComm: false,
  translationSupport: false,
  firstAidTrained: false,
  medicationSupport: false,
  conditionAwareness: false,

  // Vehicle amenities
  amenities: [],
};

const amenityOptions = [
  "High roof",
  "Side step",
  "Hydraulic lift",
  "Large boot",
  "Double wheelchair access",
  "Oxygen tank space",
  "Electric scooter storage",
];

export default function DriverOnboardingForm() {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [firstErrorKey, setFirstErrorKey] = useState(null);

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

    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required.";
      }
    });

    requiredBooleans.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This checkbox must be checked.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFirstErrorKey(Object.keys(newErrors)[0]);
      return;
    }

    // Reset errors and submit
    setErrors({});
    setFirstErrorKey(null);

    try {
      await completeDriverOnboarding(formData);
      alert("Onboarding completed!");
      window.location.href = "/dashboard/driver";
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
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

        <div>
          <label htmlFor="vehicleType" className="block font-medium text-gray-700">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            required
            aria-required="true"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          >
            <option value="">Select vehicle type</option>
            <option value="CAR">Car</option>
            <option value="WAV">Wheelchair Accessible Vehicle</option>
            <option value="MINIBUS">Minibus</option>
          </select>
                      {errors.vehicleType && <p className="text-red-600 text-sm mt-1">{errors.vehicleType}</p>}

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
          <label htmlFor="localPostcode" className="block font-medium text-gray-700">
            Base Postcode
          </label>
          <input
            type="text"
            id="localPostcode"
            name="localPostcode"
            required
            aria-required="true"
            value={formData.localPostcode}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
            placeholder="e.g. M1 1AA"
          />
          {errors.localPostcode && <p className="text-red-600 text-sm mt-1">{errors.localPostcode}</p>}
        </div>

        <div>
          <label htmlFor="radiusMiles" className="block font-medium text-gray-700">
            Operating Radius (miles)
          </label>
          <input
            type="number"
            id="radiusMiles"
            name="radiusMiles"
            min={1}
            max={100}
            value={formData.radiusMiles}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
          />
          {errors.radiusMiles && <p className="text-red-600 text-sm mt-1">{errors.radiusMiles}</p>}
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
      </fieldset>
 <h4 className="text-md font-semibold text-blue-800 mb-6 bg-blue-50 p-3 rounded">
  Please answer the questions below accurately.  
  This ensures the right journeys are matched to your vehicle’s capabilities  
  and your personal compliance requirements.
</h4>

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
          name="wheelchairAssistance"
          checked={formData.wheelchairAssistance || false}
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
          name="quietRide"
          checked={formData.quietRide || false}
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
      <label className="flex items-center">
        <input
          type="checkbox"
          name="specificMusic"
          checked={formData.specificMusic || false}
          onChange={handleChange}
          className="mr-2"
        />
        Accommodate music preferences
      </label>
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
          name="signLanguage"
          checked={formData.signLanguage || false}
          onChange={handleChange}
          className="mr-2"
        />
        Sign language support
      </label>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="textOnlyComm"
          checked={formData.textOnlyComm || false}
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
          name="medicationSupport"
          checked={formData.medicationSupport || false}
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
</fieldset>

      <Button
        type="submit"
        className="w-full bg-blue-700 text-white"
        aria-label="Submit driver onboarding form"
      >
        Submit Application
      </Button>
    </form>
  );
};

