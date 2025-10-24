"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";

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

  // ✅ Centralized submission logic
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

      // Check BOTH response.ok AND data.valid
      if (!postcodeValidation.ok || !postcodeData.valid) {
        toast.dismiss();
        toast.error(postcodeData.error || "Postcode not found", {
          duration: 5000,
        });
        
        // Scroll to postcode field
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
        postcode: postcodeData.coordinates.postcode, // Normalized
        lat: postcodeData.coordinates.lat,            // Float
        lng: postcodeData.coordinates.lng,            // Float
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
      
      // ✅ Refresh to reload the page with updated adminOnboarded status
      router.refresh();
    } catch (err) {
      toast.dismiss();
      console.error("Onboarding failed:", err);
      toast.error(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Validate coordinators before submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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

        <Input
          id="contactNumber"
          type="tel"
          placeholder="Contact Number"
          required
          value={formData.contactNumber}
          onChange={handleChange}
        />

        <Input
          id="name"
          placeholder="Contact Name"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <Input
          id="type"
          placeholder="Business Type (e.g., Care Home, Day Center)"
          required
          value={formData.type}
          onChange={handleChange}
        />

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

        {/* UPDATED POSTCODE INPUT */}
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
          placeholder="Website (optional)"
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

            <Input
              type="tel"
              placeholder="Phone"
              value={coord.phone}
              onChange={(e) => handleCoordinatorChange(index, "phone", e.target.value)}
            />

            <Input
              placeholder="Area (optional)"
              value={coord.area}
              onChange={(e) => handleCoordinatorChange(index, "area", e.target.value)}
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