// components/forms/driver/DriverEditForm.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { updateDriverDetails } from "@/app/actions/driver/driverDetails"; // New action for updates

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

const amenityOptions = [
  "High roof",
  "Side step",
  "Hydraulic lift",
  "Large boot",
  "Double wheelchair access",
  "Oxygen tank space",
  "Electric scooter storage",
];

export default function DriverEditForm({ driver, accessibilityProfile, compliance }) {
  // Merge all data into one form state
  const [formData, setFormData] = useState({
    // Driver fields
    name: driver?.name || "",
    vehicleType: driver?.vehicleType || "",
    vehicleReg: driver?.vehicleReg || "",
    localPostcode: driver?.localPostcode || "",
    radiusMiles: driver?.radiusMiles || 5,
    phone: driver?.phone || "",
    amenities: driver?.amenities || [],

    // Compliance fields
    licenceNumber: compliance?.licenceNumber || "",
    ukDrivingLicence: compliance?.ukDrivingLicence || false,
    localAuthorityRegistered: compliance?.localAuthorityRegistered || false,
    dbsChecked: compliance?.dbsChecked || false,
    publicLiabilityInsurance: compliance?.publicLiabilityInsurance || false,
    fullyCompInsurance: compliance?.fullyCompInsurance || false,
    healthCheckPassed: compliance?.healthCheckPassed || false,
    englishProficiency: compliance?.englishProficiency || false,

    // Accessibility fields (CORRECTED NAMES)
    wheelchairAccess: accessibilityProfile?.wheelchairAccess || false,
    doubleWheelchairAccess: accessibilityProfile?.doubleWheelchairAccess || false,
    highRoof: accessibilityProfile?.highRoof || false,
    seatTransferHelp: accessibilityProfile?.seatTransferHelp || false,
    mobilityAidStorage: accessibilityProfile?.mobilityAidStorage || false,
    electricScooterStorage: accessibilityProfile?.electricScooterStorage || false,
    
    quietEnvironment: accessibilityProfile?.quietEnvironment || false,
    noConversation: accessibilityProfile?.noConversation || false,
    noScents: accessibilityProfile?.noScents || false,
    specificMusic: accessibilityProfile?.specificMusic || "",
    visualSchedule: accessibilityProfile?.visualSchedule || false,
    
    signLanguageRequired: accessibilityProfile?.signLanguageRequired || false,
    textOnlyCommunication: accessibilityProfile?.textOnlyCommunication || false,
    translationSupport: accessibilityProfile?.translationSupport || false,
    
    femaleDriverOnly: accessibilityProfile?.femaleDriverOnly || false,
    firstAidTrained: accessibilityProfile?.firstAidTrained || false,
    medicationOnBoard: accessibilityProfile?.medicationOnBoard || false,
    conditionAwareness: accessibilityProfile?.conditionAwareness || false,
  });

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

    setErrors({});
    setFirstErrorKey(null);

    try {
      const result = await updateDriverDetails(formData, driver.id);
      if (result.success) {
        alert("Driver details updated!");
        window.location.href = "/dashboard/driver";
      } else {
        alert(result.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-6 max-w-3xl mx-auto mt-8"
    >
      <h2 className="text-xl font-bold text-blue-800">
        Update Personal or Vehicle Details
      </h2>

      {/* Personal Information */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-700">
          Personal Information
        </legend>

        <TextInput
          id="name"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        <SelectInput
          id="vehicleType"
          label="Vehicle Type"
          value={formData.vehicleType}
          onChange={handleChange}
          options={[
            { label: "Select vehicle type", value: "" },
            { label: "Car", value: "CAR" },
            { label: "Wheelchair Accessible Vehicle", value: "WAV" },
            { label: "Minibus", value: "MINIBUS" },
          ]}
          error={errors.vehicleType}
        />
        <TextInput
          id="vehicleReg"
          label="Vehicle Reg Number"
          value={formData.vehicleReg}
          onChange={handleChange}
          error={errors.vehicleReg}
        />
        <TextInput
          id="licenceNumber"
          label="Licence Number"
          value={formData.licenceNumber}
          onChange={handleChange}
          error={errors.licenceNumber}
        />
        <TextInput
          id="localPostcode"
          label="Base Postcode"
          value={formData.localPostcode}
          onChange={handleChange}
          error={errors.localPostcode}
        />
        <NumberInput
          id="radiusMiles"
          label="Operating Radius (miles)"
          value={formData.radiusMiles}
          onChange={handleChange}
          error={errors.radiusMiles}
        />
        <TextInput
          id="phone"
          label="Contact Phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />
      </fieldset>

      {/* Compliance */}
      <fieldset className="border p-4 rounded space-y-2">
        <legend className="font-semibold text-gray-700">
          Compliance Requirements
        </legend>
        {[
          { name: "ukDrivingLicence", label: "UK Driving Licence" },
          { name: "localAuthorityRegistered", label: "Local Authority Registered" },
          { name: "dbsChecked", label: "DBS Checked" },
          { name: "publicLiabilityInsurance", label: "Public Liability Insurance" },
          { name: "fullyCompInsurance", label: "Fully Comprehensive Insurance" },
          { name: "healthCheckPassed", label: "Health Check Passed" },
          { name: "englishProficiency", label: "English Proficiency" },
        ].map((field) => (
          <CheckboxInput
            key={field.name}
            id={field.name}
            label={field.label}
            checked={formData[field.name]}
            onChange={handleChange}
            error={errors[field.name]}
          />
        ))}
      </fieldset>

      {/* Vehicle Amenities */}
      <fieldset className="border p-4 rounded space-y-2">
        <legend className="font-semibold text-gray-700">Vehicle Amenities</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {amenityOptions.map((a) => (
            <div key={a} className="flex items-center">
              <input
                type="checkbox"
                id={a}
                value={a}
                checked={formData.amenities?.includes(a) || false}
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

      {/* Accessibility Options */}
      <fieldset className="space-y-4 mt-6">
        <legend className="text-lg font-semibold text-blue-900">
          Accessibility & Support Options
        </legend>

        {/* Mobility */}
        <fieldset className="border p-4 rounded">
          <legend className="text-md font-semibold text-gray-700 mb-2">
            Mobility Support
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CheckboxInput
              id="wheelchairAccess"
              label="Wheelchair assistance offered"
              checked={formData.wheelchairAccess}
              onChange={handleChange}
            />
            <CheckboxInput
              id="seatTransferHelp"
              label="Help with seat transfers"
              checked={formData.seatTransferHelp}
              onChange={handleChange}
            />
            <CheckboxInput
              id="mobilityAidStorage"
              label="Assistance storing mobility aids"
              checked={formData.mobilityAidStorage}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Sensory */}
        <fieldset className="border p-4 rounded">
          <legend className="text-md font-semibold text-gray-700 mb-2">
            Sensory Preferences
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CheckboxInput
              id="quietEnvironment"
              label="Quiet ride / no conversation"
              checked={formData.quietEnvironment}
              onChange={handleChange}
            />
            <CheckboxInput
              id="noScents"
              label="No perfume or strong scents"
              checked={formData.noScents}
              onChange={handleChange}
            />
            <div className="col-span-2">
              <label htmlFor="specificMusic" className="block text-sm font-medium text-gray-700 mb-1">
                Music Preferences
              </label>
              <input
                type="text"
                id="specificMusic"
                name="specificMusic"
                value={formData.specificMusic}
                onChange={handleChange}
                placeholder="e.g., Classical, No music, Passenger choice"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-500"
              />
            </div>
            <CheckboxInput
              id="visualSchedule"
              label="Provide visual schedule"
              checked={formData.visualSchedule}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Communication */}
        <fieldset className="border p-4 rounded">
          <legend className="text-md font-semibold text-gray-700 mb-2">
            Communication
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CheckboxInput
              id="signLanguageRequired"
              label="Sign language support"
              checked={formData.signLanguageRequired}
              onChange={handleChange}
            />
            <CheckboxInput
              id="textOnlyCommunication"
              label="Text-only communication"
              checked={formData.textOnlyCommunication}
              onChange={handleChange}
            />
            <CheckboxInput
              id="translationSupport"
              label="Translation support available"
              checked={formData.translationSupport}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Safety & Health */}
        <fieldset className="border p-4 rounded">
          <legend className="text-md font-semibold text-gray-700 mb-2">
            Safety & Health
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CheckboxInput
              id="firstAidTrained"
              label="First Aid trained"
              checked={formData.firstAidTrained}
              onChange={handleChange}
            />
            <CheckboxInput
              id="medicationOnBoard"
              label="Can carry/store medication safely"
              checked={formData.medicationOnBoard}
              onChange={handleChange}
            />
            <CheckboxInput
              id="conditionAwareness"
              label="Experience with autism / dementia"
              checked={formData.conditionAwareness}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Additional */}
        <fieldset className="border p-4 rounded">
          <legend className="text-md font-semibold text-gray-700 mb-2">
            Additional Preferences
          </legend>
          <CheckboxInput
            id="femaleDriverOnly"
            label="This vehicle is driven by female drivers only"
            checked={formData.femaleDriverOnly}
            onChange={handleChange}
          />
        </fieldset>
      </fieldset>

      <Button type="submit" className="w-full bg-blue-700 text-white">
        Save Changes
      </Button>
    </form>
  );
}

// Reusable components
const TextInput = ({ id, label, value, onChange, error }) => (
  <div>
    <label htmlFor={id} className="block font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      id={id}
      name={id}
      value={value || ""}
      onChange={onChange}
      className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
    />
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

const NumberInput = ({ id, label, value, onChange, error }) => (
  <div>
    <label htmlFor={id} className="block font-medium text-gray-700">
      {label}
    </label>
    <input
      type="number"
      id={id}
      name={id}
      value={value || 5}
      onChange={onChange}
      className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
    />
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

const SelectInput = ({ id, label, value, onChange, options, error }) => (
  <div>
    <label htmlFor={id} className="block font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value || ""}
      onChange={onChange}
      className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

const CheckboxInput = ({ id, label, checked, onChange, error }) => (
  <div className="flex flex-col">
    <label className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={checked || false}
        onChange={onChange}
        className="mr-2"
      />
      <span className="text-gray-700">{label}</span>
    </label>
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);