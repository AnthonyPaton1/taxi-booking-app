//app/components/dashboard/driver/EditDriverprofileClient
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, User, Car, MapPin, Settings, Shield } from "lucide-react";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";
import { validatePhoneUK } from "@/lib/phoneValidation";

export default function EditDriverProfileClient({ user, driver }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    // Personal Info
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || driver.phone || "",

    // Vehicle Info
    vehicleType: driver.vehicleType || "",
    vehicleReg: driver.vehicleReg || "",
    
    // Location
    localPostcode: driver.localPostcode || "",
    radiusMiles: driver.radiusMiles || 10,

    // Compliance
    dbsChecked: driver.compliance?.dbsChecked || false,
    licenceNumber: driver.compliance?.licenceNumber || "",
    localAuthorityRegistered: driver.compliance?.localAuthorityRegistered || false,
    publicLiabilityInsurance: driver.compliance?.publicLiabilityInsurance || false,
    fullyCompInsurance: driver.compliance?.fullyCompInsurance || false,
    healthCheckPassed: driver.compliance?.healthCheckPassed || false,
    englishProficiency: driver.compliance?.englishProficiency || false,
    ukDrivingLicence: driver.compliance?.ukDrivingLicence || false,

    // Accessibility Features
    wheelchairAccess: driver.accessibilityProfile?.wheelchairAccess || false,
    doubleWheelchairAccess: driver.accessibilityProfile?.doubleWheelchairAccess || false,
    highRoof: driver.accessibilityProfile?.highRoof || false,
    seatTransferHelp: driver.accessibilityProfile?.seatTransferHelp || false,
    mobilityAidStorage: driver.accessibilityProfile?.mobilityAidStorage || false,
    electricScooterStorage: driver.accessibilityProfile?.electricScooterStorage || false,
    
    // Capacity
    passengerCount: driver.accessibilityProfile?.passengerCount || 4,
    wheelchairUsers: driver.accessibilityProfile?.wheelchairUsers || 0,
    
    // Sensory
    quietEnvironment: driver.accessibilityProfile?.quietEnvironment || false,
    noConversation: driver.accessibilityProfile?.noConversation || false,
    noScents: driver.accessibilityProfile?.noScents || false,
    specificMusic: driver.accessibilityProfile?.specificMusic || "",
    visualSchedule: driver.accessibilityProfile?.visualSchedule || false,
    
    // Communication
    signLanguageRequired: driver.accessibilityProfile?.signLanguageRequired || false,
    textOnlyCommunication: driver.accessibilityProfile?.textOnlyCommunication || false,
    preferredLanguage: driver.accessibilityProfile?.preferredLanguage || "",
    translationSupport: driver.accessibilityProfile?.translationSupport || false,
    
    // Special Requirements
    assistanceRequired: driver.accessibilityProfile?.assistanceRequired || false,
    assistanceAnimal: driver.accessibilityProfile?.assistanceAnimal || false,
    familiarDriverOnly: driver.accessibilityProfile?.familiarDriverOnly || false,
    femaleDriverOnly: driver.accessibilityProfile?.femaleDriverOnly || false,
    nonWAVvehicle: driver.accessibilityProfile?.nonWAVvehicle || false,
    
    // Health & Safety
    medicationOnBoard: driver.accessibilityProfile?.medicationOnBoard || false,
    medicalConditions: driver.accessibilityProfile?.medicalConditions || "",
    firstAidTrained: driver.accessibilityProfile?.firstAidTrained || false,
    conditionAwareness: driver.accessibilityProfile?.conditionAwareness || false,
    
    // Additional
    additionalNeeds: driver.accessibilityProfile?.additionalNeeds || "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Create payload starting with current form data
    let payload = { ...formData };

    if (formData.phone) {
  const phoneValidation = validatePhoneUK(formData.phone);
  if (!phoneValidation.valid) {
    toast.error(phoneValidation.message || "Invalid UK phone number");
    setActiveTab("personal");
    setTimeout(() => {
      const phoneField = document.getElementById("phone");
      if (phoneField) {
        phoneField.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneField.focus();
      }
    }, 100);
    setLoading(false);
    return;
  }
  // Update with formatted phone
  formData.phone = phoneValidation.formatted;
}

    // Only validate postcode via API if it changed
    if (formData.localPostcode !== driver.localPostcode) {
      toast.loading("Verifying postcode...");


      
      const postcodeValidation = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: formData.localPostcode }),
      });

      const postcodeData = await postcodeValidation.json();

      // Check if validation failed
      if (!postcodeValidation.ok || !postcodeData.valid) {
        const errorMessage = postcodeData.error || "Postcode not found";
        
        toast.dismiss();
        toast.error(errorMessage, { duration: 5000 });
        
        setActiveTab("location");
        setTimeout(() => {
          const postcodeField = document.getElementById("driver-postcode");
          if (postcodeField) {
            postcodeField.scrollIntoView({ behavior: "smooth", block: "center" });
            postcodeField.focus();
          }
        }, 100);
        
        setLoading(false);
        return;
      }

      //  Update payload with new coordinates
      payload = {
        ...payload,
        localPostcode: postcodeData.coordinates.postcode,
        baseLat: postcodeData.coordinates.lat,
        baseLng: postcodeData.coordinates.lng,
      };
      
      toast.dismiss();
    } else {
      //  If postcode didn't change, keep existing coordinates
      payload = {
        ...payload,
        baseLat: driver.baseLat,
        baseLng: driver.baseLng,
      };
    }

    toast.loading("Updating profile...");

    const response = await fetch(`/api/driver/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), //  Use payload instead of formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to update profile");
    }

    toast.dismiss();
    toast.success("Profile updated successfully!");
    
    setTimeout(() => {
      router.push("/dashboard/driver");
      router.refresh();
    }, 1000);
    
  } catch (err) {
    toast.dismiss();
    setError(err.message);
    toast.error(err.message || "Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("personal")}
            className={`pb-4 border-b-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "personal"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-5 h-5" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("vehicle")}
            className={`pb-4 border-b-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "vehicle"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Car className="w-5 h-5" />
            Vehicle Details
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`pb-4 border-b-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "location"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MapPin className="w-5 h-5" />
            Service Area
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`pb-4 border-b-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "compliance"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="w-5 h-5" />
            Compliance
          </button>
          <button
            onClick={() => setActiveTab("accessibility")}
            className={`pb-4 border-b-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "accessibility"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="w-5 h-5" />
            Accessibility
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for login and notifications
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="07700 900000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers will contact you on this number
              </p>
            </div>
          </div>
        )}

        {/* Vehicle Tab */}
        {activeTab === "vehicle" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="vehicleType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select vehicle type</option>
                <option value="Car">Standard Car</option>
                <option value="WAV">Wheelchair Accessible Vehicle (WAV)</option>
                <option value="Minibus">Minibus</option>
                
              </select>
            </div>

            <div>
              <label
                htmlFor="vehicleReg"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vehicle Registration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vehicleReg"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleChange}
                required
                placeholder="AB12 CDE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
            </div>
          </div>
        )}

        {/* Location Tab */}
           {activeTab === "location" && (
            <div className="space-y-4">
              <PostcodeInput
                id="driver-postcode"
                value={formData.localPostcode}
                onChange={(value) => setFormData(prev => ({ ...prev, localPostcode: value }))}
                label="Base Postcode"
                placeholder="e.g., SK3 0AA"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Your home or primary operating location
              </p>

              <div>
                <label
                  htmlFor="radiusMiles"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Service Radius (miles) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="radiusMiles"
                  name="radiusMiles"
                  value={formData.radiusMiles}
                  onChange={handleChange}
                  required
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How far you're willing to travel for jobs (1-50 miles)
                </p>
              </div>
            </div>
          )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✓ Ensure all compliance items are checked to maintain your active driver status
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                License & Registration
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="ukDrivingLicence"
                    checked={formData.ukDrivingLicence}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      UK Driving Licence
                    </span>
                    <p className="text-sm text-gray-600">
                      Valid UK driving license for the vehicle category
                    </p>
                  </div>
                </label>

                <div className="pl-8">
                  <label
                    htmlFor="licenceNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Licence Number
                  </label>
                  <input
                    type="text"
                    id="licenceNumber"
                    name="licenceNumber"
                    value={formData.licenceNumber}
                    onChange={handleChange}
                    placeholder="e.g. SMITH123456AB7CD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="localAuthorityRegistered"
                    checked={formData.localAuthorityRegistered}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Local Authority Registration
                    </span>
                    <p className="text-sm text-gray-600">
                      Registered with local council as PHV driver
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Checks & Insurance
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="dbsChecked"
                    checked={formData.dbsChecked}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      DBS Check Complete
                    </span>
                    <p className="text-sm text-gray-600">
                      Enhanced DBS check completed and valid
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="publicLiabilityInsurance"
                    checked={formData.publicLiabilityInsurance}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Public Liability Insurance
                    </span>
                    <p className="text-sm text-gray-600">
                      Current public liability insurance policy
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="fullyCompInsurance"
                    checked={formData.fullyCompInsurance}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Fully Comprehensive Insurance
                    </span>
                    <p className="text-sm text-gray-600">
                      Valid comprehensive vehicle insurance for hire
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Health & Language
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="healthCheckPassed"
                    checked={formData.healthCheckPassed}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Health Check Passed
                    </span>
                    <p className="text-sm text-gray-600">
                      Medical fitness to drive passengers
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="englishProficiency"
                    checked={formData.englishProficiency}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      English Proficiency
                    </span>
                    <p className="text-sm text-gray-600">
                      Can communicate effectively with passengers
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Accessibility Tab */}
        {activeTab === "accessibility" && (
          <div className="space-y-6">
           

            {/* Mobility & Physical */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">
                Mobility & Physical Access
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="wheelchairAccess"
                    checked={formData.wheelchairAccess}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Wheelchair Access
                    </span>
                    <p className="text-sm text-gray-600">
                      Vehicle can accommodate one wheelchair user
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="doubleWheelchairAccess"
                    checked={formData.doubleWheelchairAccess}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Double Wheelchair Access
                    </span>
                    <p className="text-sm text-gray-600">
                      Can accommodate two wheelchair users
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="highRoof"
                    checked={formData.highRoof}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">High Roof</span>
                    <p className="text-sm text-gray-600">
                      Extra headroom for standing passengers
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="seatTransferHelp"
                    checked={formData.seatTransferHelp}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Seat Transfer Assistance
                    </span>
                    <p className="text-sm text-gray-600">
                      Can help passengers transfer from wheelchair to seat
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="mobilityAidStorage"
                    checked={formData.mobilityAidStorage}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Mobility Aid Storage
                    </span>
                    <p className="text-sm text-gray-600">
                      Space for walkers, crutches, etc.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="electricScooterStorage"
                    checked={formData.electricScooterStorage}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Electric Scooter Storage
                    </span>
                    <p className="text-sm text-gray-600">
                      Can transport mobility scooters
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="nonWAVvehicle"
                    checked={formData.nonWAVvehicle}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Non-WAV Vehicle Available
                    </span>
                    <p className="text-sm text-gray-600">
                      Can provide standard vehicle for non-wheelchair users
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Sensory Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sensory Support
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="quietEnvironment"
                    checked={formData.quietEnvironment}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Quiet Environment
                    </span>
                    <p className="text-sm text-gray-600">
                      Can provide calm, quiet journeys
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="noConversation"
                    checked={formData.noConversation}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      No Conversation
                    </span>
                    <p className="text-sm text-gray-600">
                      Comfortable with minimal/no conversation during journey
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="noScents"
                    checked={formData.noScents}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Scent-Free Vehicle
                    </span>
                    <p className="text-sm text-gray-600">
                      No air fresheners or strong scents
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="visualSchedule"
                    checked={formData.visualSchedule}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Visual Schedule Support
                    </span>
                    <p className="text-sm text-gray-600">
                      Can provide visual journey schedules/cards
                    </p>
                  </div>
                </label>

                <div className="pl-8">
                  <label
                    htmlFor="specificMusic"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Music Preferences
                  </label>
                  <input
                    type="text"
                    id="specificMusic"
                    name="specificMusic"
                    value={formData.specificMusic}
                    onChange={handleChange}
                    placeholder="e.g., Classical, No music, Passenger choice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Communication */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Communication Support
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="signLanguageRequired"
                    checked={formData.signLanguageRequired}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Sign Language
                    </span>
                    <p className="text-sm text-gray-600">
                      Can communicate using sign language
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="textOnlyCommunication"
                    checked={formData.textOnlyCommunication}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Text-Only Communication
                    </span>
                    <p className="text-sm text-gray-600">
                      Can communicate via written notes/messages
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="translationSupport"
                    checked={formData.translationSupport}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Translation Support
                    </span>
                    <p className="text-sm text-gray-600">
                      Can provide/use translation assistance
                    </p>
                  </div>
                </label>

                <div className="pl-8">
                  <label
                    htmlFor="preferredLanguage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Additional Languages Spoken
                  </label>
                  <input
                    type="text"
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    placeholder="e.g., Polish, Urdu, Welsh"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Special Requirements
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="assistanceRequired"
                    checked={formData.assistanceRequired}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Physical Assistance
                    </span>
                    <p className="text-sm text-gray-600">
                      Can provide physical assistance (boarding, luggage, etc.)
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="assistanceAnimal"
                    checked={formData.assistanceAnimal}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Assistance Animals Welcome
                    </span>
                    <p className="text-sm text-gray-600">
                      Happy to transport guide dogs and assistance animals
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="familiarDriverOnly"
                    checked={formData.familiarDriverOnly}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Available for Regular Bookings
                    </span>
                    <p className="text-sm text-gray-600">
                      Happy to be a regular driver for passengers who need familiarity
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="femaleDriverOnly"
                    checked={formData.femaleDriverOnly}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Female Driver
                    </span>
                    <p className="text-sm text-gray-600">
                      I am a female driver (for passengers who prefer female drivers)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Health & Safety */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Health & Safety Support
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="firstAidTrained"
                    checked={formData.firstAidTrained}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      First Aid Trained
                    </span>
                    <p className="text-sm text-gray-600">
                      Have current first aid certification
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="conditionAwareness"
                    checked={formData.conditionAwareness}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Condition Awareness Training
                    </span>
                    <p className="text-sm text-gray-600">
                      Trained in autism, dementia, or other conditions
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="medicationOnBoard"
                    checked={formData.medicationOnBoard}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Medication Storage Available
                    </span>
                    <p className="text-sm text-gray-600">
                      Can safely store passenger medication during journey
                    </p>
                  </div>
                </label>

                <div className="pl-8">
                  <label
                    htmlFor="medicalConditions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Medical Conditions I'm Familiar With
                  </label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., Dementia, Autism, Epilepsy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Needs */}
            <div>
              <label
                htmlFor="additionalNeeds"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Additional Information
              </label>
              <textarea
                id="additionalNeeds"
                name="additionalNeeds"
                value={formData.additionalNeeds}
                onChange={handleChange}
                rows={4}
                placeholder="Any other accessibility features, support you can provide, or special accommodations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}