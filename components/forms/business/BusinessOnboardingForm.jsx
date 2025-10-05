// --- components/forms/business/BusinessOnboardingForm.jsx ---
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import { toast } from "sonner";

const BusinessOnboardingForm = ({ prefillData }) => {
  const [formData, setFormData] = useState({
    businessName: prefillData.businessName || "",
    contactEmail: prefillData.contactEmail || "",
    contactNumber: prefillData.contactNumber || "",
    type: "CARE",
    address1: prefillData.address1 || "",
    city: prefillData.city || "",
    postcode: prefillData.postcode || "",
    website: prefillData.website || "",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { ...formData, coordinators };

      const res = await fetch("/api/onboarding/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to submit onboarding");
      }

      toast.success("Business onboarding complete! Redirecting...");
      setTimeout(() => router.push("/dashboard/admin"), 1000);
    } catch (err) {
      console.error("Onboarding failed", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-blue-700 mb-6">
          Welcome, {prefillData.businessName || ""}! Let’s get your business set up.
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="businessName" placeholder="Business Name" required value={formData.businessName} onChange={handleChange} />
          <Input id="address1" placeholder="Street Address" required value={formData.address1} onChange={handleChange} />
          <Input id="city" placeholder="City" required value={formData.city} onChange={handleChange} />
          <Input id="postcode" placeholder="Postcode" required value={formData.postcode} onChange={handleChange} />
          <Input id="website" placeholder="Website URL" value={formData.website} onChange={handleChange} />
          <Input id="contactNumber" placeholder="Contact Number" required value={formData.contactNumber} onChange={handleChange} />
          <Input id="contactEmail" type="email" placeholder="Contact Email" required value={formData.contactEmail} onChange={handleChange} />
          <p className="text-blue-700 font-bold mt-6 mb-6 px-6">
            Add your Area Managers or Coordinators below. They will each receive an email to complete their assigned areas and onboard their House Managers.
          </p>

          {coordinators.map((coord, i) => (
            <div key={i} className="border p-4 rounded-md bg-gray-50 space-y-4">
              <Textarea placeholder="Areas Covered (e.g., Stockport)" value={coord.areas} onChange={(e) => handleCoordinatorChange(i, "areas", e.target.value)} />
              <Input placeholder="Coordinator Name" value={coord.name} onChange={(e) => handleCoordinatorChange(i, "name", e.target.value)} />
              <Input type="email" placeholder="Coordinator Email" value={coord.email} onChange={(e) => handleCoordinatorChange(i, "email", e.target.value)} />
              <Input placeholder="Coordinator Phone" value={coord.phone} onChange={(e) => handleCoordinatorChange(i, "phone", e.target.value)} />
              {coordinators.length > 1 && (
                <Button type="button" variant="destructive" onClick={() => removeCoordinator(i)}>
                  Remove
                </Button>
              )}
            </div>
          ))}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={addCoordinator}>
              + Add Another Coordinator
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-700 text-white hover:bg-blue-800">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BusinessOnboardingForm;