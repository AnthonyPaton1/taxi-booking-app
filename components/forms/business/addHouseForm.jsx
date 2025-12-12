// components/forms/business/addHouseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Info } from "lucide-react"; // Added Info
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
    username: "", // NEW
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostcodeChange = (value) => {
    setFormData((prev) => ({ ...prev, postcode: value }));
  };

  // NEW: Password validation helper
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  // NEW: Username validation helper
  const validateUsername = (username) => {
    const isValidFormat = /^[a-z0-9-]+$/.test(username);
    return username.length >= 6 && username.length <= 20 && isValidFormat;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label || !formData.line1 || !formData.city || !formData.postcode || !formData.username || !formData.password) {
      toast.error("Please complete all required fields");
      return;
    }

    // Validate username
    if (!validateUsername(formData.username)) {
      toast.error("Username must be 6-20 characters (lowercase letters, numbers, hyphens only)");
      return;
    }

    // Validate password complexity
    if (!validatePassword(formData.password)) {
      toast.error("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
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
        postcode: postcodeData.coordinates.postcode,
        notes: formData.notes,
        username: formData.username, // NEW
        password: formData.password,
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

        {/* House Staff Access Section */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="flex items-start gap-2 mb-3 bg-blue-50 p-3 rounded-md">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">House Staff Access</p>
              <p>Create login credentials for house staff to view daily and weekly bookings on a tablet. Staff will have read-only access.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="e.g., oakhouse-main, bigblue2024"
                value={formData.username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  handleChange({ target: { name: 'username', value } });
                }}
                required
                disabled={submitting}
                minLength={6}
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                6-20 characters: lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars with uppercase, lowercase, number & symbol"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  minLength={8}
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
                At least 8 characters with uppercase, lowercase, number, and special character (!@#$%^&*)
              </p>
            </div>

            {/* Confirm Password */}
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
                minLength={8}
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