// components/dashboard/admin/EditCoordinatorForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";
import { toast } from "sonner";
import { validatePhoneUK } from "@/lib/phoneValidation"; // ✅ Added validation

export default function EditCoordinatorForm({ coordinator, existingAreas }) {
  const [formData, setFormData] = useState({
    name: coordinator.user.name || "",
    email: coordinator.user.email || "",
    phone: coordinator.user.phone || "",
    area: coordinator.user.area?.name || "",
    createNewArea: false,
    newAreaName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ✅ VALIDATE PHONE NUMBER
    if (formData.phone) {
      const phoneValidation = validatePhoneUK(formData.phone);
      if (!phoneValidation.valid) {
        toast.error(phoneValidation.message || "Invalid UK phone number");
        setSubmitting(false);
        // Focus the phone field
        setTimeout(() => {
          const phoneField = document.querySelector('input[name="phone"]');
          if (phoneField) {
            phoneField.scrollIntoView({ behavior: "smooth", block: "center" });
            phoneField.focus();
          }
        }, 100);
        return;
      }
      // Update with formatted phone number
      formData.phone = phoneValidation.formatted;
    }

    // Validate area
    const areaName = formData.createNewArea ? formData.newAreaName : formData.area;
    if (!areaName) {
      toast.error("Please select or create an area");
      setSubmitting(false);
      return;
    }

    try {
  const res = await fetch(`/api/admin/coordinators/${coordinator.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      area: areaName,
    }),
  });

  const data = await res.json();

  if (data.success) {
    toast.success("Coordinator updated!");
    setTimeout(() => {
      router.push("/dashboard/admin/coordinators");
    }, 1500);
  } else {
    toast.error(data.error || "Failed to update coordinator");
    setSubmitting(false);
  }
} catch (error) {
  console.error("Error updating coordinator:", error);
  toast.error("Something went wrong. Please try again or contact support.");
  setSubmitting(false);
}
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/admin/coordinators"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Coordinators
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Coordinator
        </h1>
        <p className="text-gray-600 mb-6">
          Update coordinator information and area assignment
        </p>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              readOnly
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g., 07700 900000"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              UK format: e.g. 07123456789 or +447123456789
            </p>
          </div>

          {/* Area Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area <span className="text-red-500">*</span>
            </label>

            {/* Create New Area Checkbox */}
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="createNewArea"
                  checked={formData.createNewArea}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Assign to a new area</span>
              </label>
            </div>

            {formData.createNewArea ? (
              <input
                type="text"
                name="newAreaName"
                value={formData.newAreaName}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., South Manchester"
              />
            ) : (
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an area...</option>
                {existingAreas.map((area) => (
                  <option key={area.id} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={() => router.push("/dashboard/admin/coordinators")}
              variant="outline"
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}