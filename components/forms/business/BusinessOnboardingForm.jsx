"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";
import { validateUKPhone } from "@/lib/phoneValidation";

export default function BusinessOnboardingForm({ prefillData = {} }) {
  const {
    businessName = "",
    contactEmail = "",
    contactNumber = "",
    name = "",
    type = "",
    address1 = "",
    city = "",
    postcode = "",
    website = "",
  } = prefillData;

  const [coordinators, setCoordinators] = useState([
    {
      name: "",
      email: "",
      phone: "",
      area: "",
    },
  ]);

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName,
    contactEmail,
    contactNumber,
    name,
    type,
    address1,
    city,
    postcode,
    website,
  });

  const handleCoordinatorChange = (index, field, value) => {
    const updated = [...coordinators];
    updated[index][field] = value;
    setCoordinators(updated);
  };

  const addCoordinator = () => {
    setCoordinators([
      ...coordinators,
      { name: "", email: "", phone: "", area: "" },
    ]);
  };

  const removeCoordinator = (index) => {
    setCoordinators(coordinators.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Centralized submission logic
  const submitOnboarding = async (coordinatorsToSubmit) => {
    setSubmitting(true);
    try {
      // Step 1: Validate postcode and get coordinates
      toast.loading("Verifying business postcode...");
      
      const postcodeValidation = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: formData.postcode }),
      });

      const postcodeData = await postcodeValidation.json();

      if (!postcodeValidation.ok || !postcodeData.valid) {
        toast.dismiss();
        toast.error(postcodeData.error || "Postcode not found", {
          duration: 5000,
        });
        
        setTimeout(() => {
          const postcodeField = document.getElementById("business-postcode");
          if (postcodeField) {
            postcodeField.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            postcodeField.focus();
          }
        }, 100);
        
        setSubmitting(false);
        return;
      }

      toast.dismiss();
      toast.loading("Submitting business details...");

      // Step 2: Add normalized postcode and coordinates to payload
      const payload = {
        ...formData,
        postcode: postcodeData.coordinates.postcode,
        lat: postcodeData.coordinates.lat,
        lng: postcodeData.coordinates.lng,
        coordinators: coordinatorsToSubmit,
      };

      const res = await fetch("/api/onboarding/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to submit onboarding");
      }

      toast.dismiss();
      toast.success("Business onboarding complete!");
      
      router.refresh();
    } catch (err) {
      toast.dismiss();
      console.error("Onboarding failed:", err);
      toast.error(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Validate coordinators and phones before submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATE BUSINESS CONTACT PHONE
    const businessPhoneValidation = validateUKPhone(formData.contactNumber);
    if (!businessPhoneValidation.isValid) {
      toast.error(`Business phone: ${businessPhoneValidation.error || "Invalid UK phone number"}`);
      setTimeout(() => {
        const phoneField = document.getElementById("contactNumber");
        if (phoneField) {
          phoneField.scrollIntoView({ behavior: "smooth", block: "center" });
          phoneField.focus();
        }
      }, 100);
      return;
    }
    // Update with formatted phone
    formData.contactNumber = businessPhoneValidation.formatted;

    // Filter out completely empty coordinators
    const filledCoordinators = coordinators.filter(
      (coord) => coord.name || coord.email || coord.phone || coord.area
    );

    // Check if any filled coordinator is incomplete
    const hasIncompleteCoordinators = filledCoordinators.some(
      (coord) => !coord.name || !coord.email || !coord.phone
    );

    if (hasIncompleteCoordinators) {
      toast.error("Please complete all coordinator fields or remove incomplete entries");
      return;
    }

    // ✅ VALIDATE ALL COORDINATOR PHONES
    for (let i = 0; i < filledCoordinators.length; i++) {
      const phoneValidation = validateUKPhone(filledCoordinators[i].phone);
      if (!phoneValidation.isValid) {
        toast.error(`Coordinator ${i + 1}: ${phoneValidation.error || "Invalid UK phone number"}`);
        setTimeout(() => {
          const phoneField = document.getElementById(`coordinator-phone-${i}`);
          if (phoneField) {
            phoneField.scrollIntoView({ behavior: "smooth", block: "center" });
            phoneField.focus();
          }
        }, 100);
        return;
      }
      // Update with formatted phone
      filledCoordinators[i].phone = phoneValidation.formatted;
    }

    await submitOnboarding(filledCoordinators);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Details Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Business Details</h2>
        
        <Input
          id="businessName"
          placeholder="Business Name"
          required
          value={formData.businessName}
          onChange={handleChange}
        />

        <Input
          id="contactEmail"
          type="email"
          placeholder="Contact Email"
          required
          value={formData.contactEmail}
          onChange={handleChange}
        />

        <div>
          <Input
            id="contactNumber"
            type="tel"
            placeholder="Contact Number"
            required
            value={formData.contactNumber}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            UK format: e.g. 07123456789 or +447123456789
          </p>
        </div>

        <Input
          id="name"
          placeholder="Contact Name"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <div className="mb-8 mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4 -mx-6 -mt-6 mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              What type of organization are you? <span className="text-yellow-300">*</span>
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              This helps us customize your experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="group cursor-pointer">
              <input
                type="radio"
                name="type"
                value="CARE"
                required
                className="peer hidden"
              />
              <div className="border-2 border-gray-200 rounded-lg p-6 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:shadow-lg hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏥</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Care Provider</h4>
                <p className="text-sm text-gray-600">
                  Supported living, healthcare facilities, residential care homes, and care organizations
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-semibold text-blue-600 uppercase">Best for care services</span>
                </div>
              </div>
            </label>
            
            <label className="group cursor-pointer">
              <input
                type="radio"
                name="type"
                value="TAXI"
                required
                className="peer hidden"
              />
              <div className="border-2 border-gray-200 rounded-lg p-6 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:shadow-lg hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🚖</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Transport Company</h4>
                <p className="text-sm text-gray-600">
                  Taxi services, accessible transport providers, private hire vehicles, and transport businesses
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-semibold text-blue-600 uppercase">Best for transport</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <Input
          id="address1"
          placeholder="Address Line 1"
          required
          value={formData.address1}
          onChange={handleChange}
        />

        <Input
          id="city"
          placeholder="City"
          required
          value={formData.city}
          onChange={handleChange}
        />

        <PostcodeInput
          id="business-postcode"
          value={formData.postcode}
          onChange={(value) => setFormData(prev => ({ ...prev, postcode: value }))}
          label="Business Postcode"
          placeholder="e.g., SK3 0AA"
          required
        />

        <Input
          id="website"
          type="url"
          placeholder="Website "
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      {/* Coordinators Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coordinators</h2>
        
        {coordinators.map((coord, index) => (
          <div key={index} className="p-4 border rounded space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Coordinator {index + 1}</h3>
              {coordinators.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeCoordinator(index)}
                >
                  Remove
                </Button>
              )}
            </div>

            <Input
              placeholder="Name"
              value={coord.name}
              onChange={(e) => handleCoordinatorChange(index, "name", e.target.value)}
            />

            <Input
              type="email"
              placeholder="Email"
              value={coord.email}
              onChange={(e) => handleCoordinatorChange(index, "email", e.target.value)}
            />

            <div>
              <Input
                id={`coordinator-phone-${index}`}
                type="tel"
                placeholder="Phone"
                value={coord.phone}
                onChange={(e) => handleCoordinatorChange(index, "phone", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                UK format: e.g. 07123456789 or +447123456789
              </p>
            </div>

            <Input
              placeholder="Area"
              value={coord.area}
              onChange={(e) => handleCoordinatorChange(index, "area", e.target.value)}
              required
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addCoordinator}
          className="w-full"
        >
          + Add Another Coordinator
        </Button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Submitting..." : "Complete Business Onboarding"}
      </Button>
    </form>
  );
}