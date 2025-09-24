"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import { toast } from "sonner";

const Onboarding = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [coordinators, setCoordinators] = useState([
    {
      name: "",
      email: "",
      phone: "",
      areas: "",
    },
  ]);
  const [formData, setFormData] = useState({
    businessName: "",
    addressLine1: "",
    city: "",
    postcode: "",
    website: "",
    contactNumber: "",
    contactEmail: "",
  });

  const handleCoordinatorChange = (index, field, value) => {
    const updated = [...coordinators];
    updated[index][field] = value;
    setCoordinators(updated);
  };

  const addCoordinator = () => {
    setCoordinators([
      ...coordinators,
      { name: "", email: "", phone: "", areas: "" },
    ]);
  };

  const removeCoordinator = (index) => {
    setCoordinators(coordinators.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const payload = { ...formData, coordinators };
      const res = await fetch("/api/edit-details", {
        method: "PUT", // or "POST" if it’s a new form
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      if (res.ok) {
        toast.success("Updated successfully! Redirecting...");
        setTimeout(() => router.push("/dashboard/admin"), 1000);
      }

      // ✅ Redirect to dashboard (adjust path if needed)
      router.push("/dashboard/admin");
    } catch (err) {
      console.error("Update failed", err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Coordinator Onboarding
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="businessName"
            placeholder="Business Name"
            required
            value={formData.businessName}
            onChange={handleChange}
            aria-label="Business Name"
          />
          <Input
            id="addressLine1"
            placeholder="Address Line 1"
            required
            value={formData.addressLine1}
            onChange={handleChange}
            aria-label="Address Line 1"
          />
          <Input
            id="city"
            placeholder="City"
            required
            value={formData.city}
            onChange={handleChange}
            aria-label="City"
          />
          <Input
            id="postcode"
            placeholder="Postcode"
            required
            value={formData.postcode}
            onChange={handleChange}
            aria-label="Postcode"
          />
          <Input
            id="website"
            placeholder="Website URL"
            required
            value={formData.website}
            onChange={handleChange}
            aria-label="Business Website"
          />
          <Input
            id="contactNumber"
            placeholder="Business Contact Number"
            required
            value={formData.contactNumber}
            onChange={handleChange}
            aria-label="Contact Number"
          />
          <Input
            id="contactEmail"
            type="email"
            placeholder="Business Contact Email"
            required
            value={formData.contactEmail}
            onChange={handleChange}
            aria-label="Contact Email"
          />

          {coordinators.map((coord, i) => (
            <div key={i} className="border p-4 rounded-md bg-gray-50 space-y-4">
              <Textarea
                placeholder="Areas covered (e.g., LS1, LS2)"
                value={coord.areas}
                onChange={(e) =>
                  handleCoordinatorChange(i, "areas", e.target.value)
                }
              />
              <Input
                placeholder="Coordinator Name"
                value={coord.name}
                onChange={(e) =>
                  handleCoordinatorChange(i, "name", e.target.value)
                }
              />
              <Input
                type="email"
                placeholder="Coordinator Email"
                value={coord.email}
                onChange={(e) =>
                  handleCoordinatorChange(i, "email", e.target.value)
                }
              />
              <Input
                placeholder="Coordinator Phone Number"
                value={coord.phone}
                onChange={(e) =>
                  handleCoordinatorChange(i, "phone", e.target.value)
                }
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
    </>
  );
};

export default Onboarding;
