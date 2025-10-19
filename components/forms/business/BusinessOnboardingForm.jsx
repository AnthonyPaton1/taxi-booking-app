// --- components/forms/business/BusinessOnboardingForm.jsx ---
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    const payload = { ...formData, coordinators: coordinatorsToSubmit };

    const res = await fetch("/api/onboarding/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error("Failed to submit onboarding");
    }

    toast.success("Business onboarding complete!");
    
    // ✅ Refresh to reload the page with updated adminOnboarded status
    router.refresh();
  } catch (err) {
    console.error("Onboarding failed:", err);
    toast.error("Something went wrong. Try again.");
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold text-blue-700 mb-6">
        Welcome, {prefillData.businessName || ""}! Let's get your business set up.
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="businessName"
          placeholder="Business Name"
          required
          value={formData.businessName}
          onChange={handleChange}
        />
        <Input
          id="address1"
          placeholder="Street Address"
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
        <Input
          id="postcode"
          placeholder="Postcode"
          required
          value={formData.postcode}
          onChange={handleChange}
        />
        <Input
          id="website"
          placeholder="Website URL"
          value={formData.website}
          onChange={handleChange}
        />
        <Input
          id="contactNumber"
          placeholder="Office/Landline Number"
          required
          value={formData.contactNumber}
          onChange={handleChange}
        />
 
<p className="text-xs text-gray-500">
  This will be the main contact number for this area
</p>
        <Input
          id="contactEmail"
          type="email"
          placeholder="Contact Email"
          required
          value={formData.contactEmail}
          onChange={handleChange}
        />

        <p className="text-blue-700 font-bold mt-6 mb-6 px-6">
          Add your Area Managers or Coordinators below. They will each receive an email to complete their assigned areas and onboard their House Managers.
        </p>

        <div className="mb-4 px-6">
          <button
            type="button"
            onClick={() => submitOnboarding([])}
            className="inline-block text-sm text-gray-600 underline hover:text-gray-800 mr-4"
            disabled={submitting}
          >
            Skip this step
          </button>
          <p className="text-xs text-gray-500 mt-2">
            You can add coordinators later from the dashboard under Edit Business details.
          </p>
        </div>

        {coordinators.map((coord, i) => (
          <div key={i} className="border p-4 rounded-md bg-gray-50 space-y-4">
            <Textarea
              placeholder="Area Covered (e.g., Stockport)"
              value={coord.area}
              onChange={(e) => handleCoordinatorChange(i, "area", e.target.value)}
            />
            <Input
              placeholder="Coordinator Name"
              value={coord.name}
              onChange={(e) => handleCoordinatorChange(i, "name", e.target.value)}
            />
            <Input
              type="email"
              placeholder="Coordinator Email"
              value={coord.email}
              onChange={(e) => handleCoordinatorChange(i, "email", e.target.value)}
            />
            <Input
              placeholder="Coordinator Phone"
              value={coord.phone}
              onChange={(e) => handleCoordinatorChange(i, "phone", e.target.value)}
            />
            {coordinators.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeCoordinator(i)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={addCoordinator}>
            + Add Another Coordinator
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}