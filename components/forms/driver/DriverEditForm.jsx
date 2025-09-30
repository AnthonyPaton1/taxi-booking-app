// components/forms/driver/DriverEditForm.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { completeDriverOnboarding } from "@/app/actions/driver/driverDetails";

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

export default function DriverEditForm({ formData: initialData }) {
  const [formData, setFormData] = useState(initialData || {});
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
      await completeDriverOnboarding(formData);
      alert("Driver details updated!");
      window.location.href = "/dashboard/driver";
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
      <h2 className="text-xl font-bold text-blue-800">Update and Edit your Personal or Vehicle Details </h2>

      {/* Personal Information */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-700">
          Personal Information
        </legend>

        <TextInput id="name" label="Full Name" value={formData.name} onChange={handleChange} error={errors.name} />
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
        <TextInput id="vehicleReg" label="Vehicle Reg Number" value={formData.vehicleReg} onChange={handleChange} error={errors.vehicleReg} />
        <TextInput id="licenceNumber" label="Licence Number" value={formData.licenceNumber} onChange={handleChange} error={errors.licenceNumber} />
        <TextInput id="localPostcode" label="Base Postcode" value={formData.localPostcode} onChange={handleChange} error={errors.localPostcode} />
        <NumberInput id="radiusMiles" label="Operating Radius (miles)" value={formData.radiusMiles} onChange={handleChange} error={errors.radiusMiles} />
        <TextInput id="phone" label="Contact Phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
      </fieldset>

      {/* Compliance */}
      <fieldset className="border p-4 rounded space-y-2">
        <legend className="font-semibold text-gray-700">Compliance Requirements</legend>
        {requiredBooleans.map((field) => (
          <CheckboxInput
            key={field}
            id={field}
            label={prettyLabel(field)}
            checked={formData[field] || false}
            onChange={handleChange}
            error={errors[field]}
          />
        ))}
      </fieldset>

      {/* Vehicle Amenities */}
      {/* <fieldset className="border p-4 rounded space-y-2">
        <legend className="font-semibold text-gray-700">Vehicle Amenities</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {amenityOptions.map((a) => (
            <CheckboxInput
              key={a}
              id={a}
              label={a}
              checked={formData.amenities?.includes(a)}
              onChange={handleAmenityChange}
              isCustomValue={true}
            />
          ))}
        </div>
      </fieldset> */}

      {/* Accessibility Options */}
 <div className='mb-6'>

<h4 className="text-md font-semibold text-blue-800 mb-6 bg-blue-50 p-3 rounded">
Please answer the questions below accurately.  
  This ensures the right journeys are matched to your vehicle’s capabilities
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
          name="textOnlyCommunication"
          checked={formData.textOnlyCommunication
             || false}
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
    I prefer support from female drivers only
  </label>
</fieldset>
</fieldset>

      <Button type="submit" className="w-full bg-blue-700 text-white">
        Save Changes
      </Button>
    </form>
  );
}

// Reusable input components
const TextInput = ({ id, label, value, onChange, error }) => (
  <div>
    <label htmlFor={id} className="block font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      id={id}
      name={id}
      value={value}
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
      value={value}
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
      value={value}
      onChange={onChange}
      className="w-full mt-1 p-2 border rounded focus:ring focus:ring-blue-500"
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

const CheckboxInput = ({ id, label, checked, onChange, error, isCustomValue }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      name={isCustomValue ? undefined : id}
      value={id}
      checked={checked}
      onChange={onChange}
      className="mr-2"
    />
    <label htmlFor={id} className="text-gray-700">{label}</label>
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

const prettyLabel = (field) =>
  field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());