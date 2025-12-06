"use client";

import { useState } from "react";

/**
 * RideAccessibilityOptions Component
 * Provides accessibility options including vehicle type selector
 * Works with existing form structure using handleChange
 */
export default function RideAccessibilityOptions({ 
  formData, 
  setFormData, 
  handleChange,
  prefix = "" 
}) {
  const [showAllOptions, setShowAllOptions] = useState(false);

 
  const onChange = handleChange || ((e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  });

  
  const handleVehicleTypeChange = (value) => {
    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        vehicleType: value
      }));
    } else if (handleChange) {
      handleChange({
        target: {
          name: 'vehicleType',
          value: value,
          type: 'radio'
        }
      });
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Accessibility Requirements
        </h3>
        <button
          type="button"
          onClick={() => setShowAllOptions(!showAllOptions)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAllOptions ? "Show Less" : "Show All Options"}
        </button>
      </div>

      {/* VEHICLE TYPE SELECTOR (NEW) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Vehicle Type Required *
        </label>
        <div className="space-y-2">
          <label className="flex items-start cursor-pointer group">
            <input
              type="radio"
              name="vehicleType"
              value="either"
              checked={!formData.vehicleType || formData.vehicleType === 'either'}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Either (Standard or WAV)
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Accepts any available vehicle type
              </p>
            </div>
          </label>

          <label className="flex items-start cursor-pointer group">
            <input
              type="radio"
              name="vehicleType"
              value="standard"
              checked={formData.vehicleType === 'standard'}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Standard Vehicle Only
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Regular car, van, or minibus (no wheelchair access)
              </p>
            </div>
          </label>

          <label className="flex items-start cursor-pointer group">
            <input
              type="radio"
              name="vehicleType"
              value="wav"
              checked={formData.vehicleType === 'wav'}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Wheelchair Accessible Vehicle (WAV) Required
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Vehicle must have wheelchair ramp/lift access
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* CORE ACCESSIBILITY OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wheelchair Access */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            id={`${prefix}wheelchairAccess`}
            name="wheelchairAccess"
            checked={formData.wheelchairAccess || false}
            onChange={onChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
              Wheelchair User
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Passenger uses a wheelchair
            </p>
          </div>
        </label>

        {/* Female Driver Preference */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            id={`${prefix}femaleDriverOnly`}
            name="femaleDriverOnly"
            checked={formData.femaleDriverOnly || false}
            onChange={onChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
              Female Driver Preference
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Prefer female driver when available
            </p>
          </div>
        </label>

        {/* Carer Present */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            id={`${prefix}carerPresent`}
            name="carerPresent"
            checked={formData.carerPresent || false}
            onChange={onChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
              Carer/Companion Present
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Additional person traveling
            </p>
          </div>
        </label>

        {/* Assistance Required */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            id={`${prefix}assistanceRequired`}
            name="assistanceRequired"
            checked={formData.assistanceRequired || false}
            onChange={onChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
              Assistance Required
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Help getting in/out of vehicle
            </p>
          </div>
        </label>
      </div>

      {/* ADDITIONAL OPTIONS (Collapsible) */}
      {showAllOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {/* Non-WAV Vehicle */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}nonWAVvehicle`}
              name="nonWAVvehicle"
              checked={formData.nonWAVvehicle || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Non-WAV Vehicle Preferred
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Standard vehicle preferred
              </p>
            </div>
          </label>

          {/* Quiet Environment */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}quietEnvironment`}
              name="quietEnvironment"
              checked={formData.quietEnvironment || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Quiet Environment
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Minimal noise/conversation
              </p>
            </div>
          </label>

          {/* No Conversation */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}noConversation`}
              name="noConversation"
              checked={formData.noConversation || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                No Conversation
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Silent journey preferred
              </p>
            </div>
          </label>

          {/* Visual Schedule */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}visualSchedule`}
              name="visualSchedule"
              checked={formData.visualSchedule || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Visual Schedule Needed
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Visual aids for communication
              </p>
            </div>
          </label>

          {/* Assistance Animal */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}assistanceAnimal`}
              name="assistanceAnimal"
              checked={formData.assistanceAnimal || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Assistance Animal
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Service/guide dog traveling
              </p>
            </div>
          </label>

          {/* Familiar Driver */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}familiarDriverOnly`}
              name="familiarDriverOnly"
              checked={formData.familiarDriverOnly || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Familiar Driver Only
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Request known/regular driver
              </p>
            </div>
          </label>

          {/* Escort Required */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}escortRequired`}
              name="escortRequired"
              checked={formData.escortRequired || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Escort Required
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Staff escort needed
              </p>
            </div>
          </label>

          {/* Sign Language */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}signLanguageRequired`}
              name="signLanguageRequired"
              checked={formData.signLanguageRequired || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Sign Language Required
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                BSL communication needed
              </p>
            </div>
          </label>

          {/* Text Communication */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}textOnlyCommunication`}
              name="textOnlyCommunication"
              checked={formData.textOnlyCommunication || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Text-Only Communication
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Written communication preferred
              </p>
            </div>
          </label>

          {/* Medication On Board */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id={`${prefix}medicationOnBoard`}
              name="medicationOnBoard"
              checked={formData.medicationOnBoard || false}
              onChange={onChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Medication On Board
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Carrying medication
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Helper Text for Vehicle Type */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
        <p className="font-medium mb-1">ℹ️ Vehicle Type Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>WAV Required:</strong> Booking will ONLY match with drivers who have wheelchair-accessible vehicles</li>
          <li><strong>Standard Only:</strong> Booking will match with regular vehicles (no wheelchair access)</li>
          <li><strong>Either:</strong> Accepts any vehicle type - gives you the widest driver availability</li>
          <li><strong>Female Driver:</strong> This is a PREFERENCE (not a requirement) - female drivers get priority in matching but male drivers can still accept if no female drivers are available</li>
        </ul>
      </div>
    </div>
  );
}