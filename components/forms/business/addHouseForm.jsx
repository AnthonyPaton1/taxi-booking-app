// components/forms/business/addHouseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    line1: "",
    city: "",
    postcode: "",
    notes: "",
    password: "", // NEW
    confirmPassword: "", // NEW
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

    if (!formData.label || !formData.line1 || !formData.city || !formData.postcode || !formData.password) {
      toast.error("Please complete all required fields");
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
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
        label: formData.label,
        line1: formData.line1,
        city: formData.city,
        postcode: postcodeData.coordinates.postcode, // Normalized
        notes: formData.notes,
        password: formData.password, // NEW: include password
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

        {/* NEW: House Password Section */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            House Staff Access
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Set a password for read-only staff access at this house
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                House Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="e.g., House123"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters (e.g., "House123" or "Spring24")
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={submitting}
                minLength={6}
              />
            </div>
          </div>
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