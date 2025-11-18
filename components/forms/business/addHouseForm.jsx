// components/forms/business/addHouseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddHouseForm({
  businessId,
  businessName,
  managerId,
  areaId,
  areaName,
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    line1: "",
    city: "",
    postcode: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostcodeChange = (value) => {
    setFormData((prev) => ({ ...prev, postcode: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label || !formData.line1 || !formData.city || !formData.postcode) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Validate postcode and get coordinates
      toast.loading("Verifying postcode...");

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
        setSubmitting(false);
        return;
      }

      toast.dismiss();
      toast.loading("Creating house...");

      // Step 2: Create house
      const payload = {
        ...formData,
        postcode: postcodeData.coordinates.postcode, // Normalized
        lat: postcodeData.coordinates.lat,
        lng: postcodeData.coordinates.lng,
        businessId,
        managerId,
        areaId,
      };

    

      const response = await fetch("/api/manager/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create house");
      }

      toast.dismiss();
      toast.success("House added successfully!");

      // Redirect to houses list
      setTimeout(() => {
        router.push("/dashboard/manager/houses");
      }, 1000);
    } catch (error) {
      toast.dismiss();
      console.error("Error creating house:", error);
      toast.error(error.message || "Failed to create house");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/manager/houses"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Houses
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Add New House</h2>
        <p className="text-gray-600 mt-2">
          Business: <span className="font-semibold">{businessName}</span> | Area:{" "}
          <span className="font-semibold">{areaName}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            House Label / Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="label"
            name="label"
            placeholder="e.g., Main House, Oak Villa, Apartment 3B"
            value={formData.label}
            onChange={handleChange}
            required
            disabled={submitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            A friendly name to identify this property
          </p>
        </div>

        <div>
          <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <Input
            id="line1"
            name="line1"
            placeholder="e.g., 123 Main Street"
            value={formData.line1}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City / Town <span className="text-red-500">*</span>
          </label>
          <Input
            id="city"
            name="city"
            placeholder="e.g., Manchester, Birmingham"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        <div>
          <PostcodeInput
            id="house-postcode"
            value={formData.postcode}
            onChange={handlePostcodeChange}
            label="Postcode"
            placeholder="e.g., SK3 0AA"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any additional information about this property..."
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            disabled={submitting}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/manager/houses")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? "Adding House..." : "Add House"}
          </Button>
        </div>
      </form>
    </div>
  );
}