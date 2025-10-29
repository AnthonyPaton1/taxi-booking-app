"use client";

import React, { useState } from "react";
import formFields from "./formFields";
import { Button } from "@/components/ui/button";
import { registerAndInviteUser } from "@/app/actions/auth/registerAndInviteUser";
import { toast } from "sonner";

const WaitlistForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    formFields.reduce(
      (acc, field) => {
        acc[field.id] = "";
        return acc;
      },
      { type: "" }
    )
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.type) {
      toast.error("Please select Business or Taxi.");
      setLoading(false);
      return;
    }

    // ✅ Map the selected business type to the correct user role
    const mappedRole = formData.type === "TAXI" ? "DRIVER" : "ADMIN";

    const payload = { ...formData, role: mappedRole };

    const result = await registerAndInviteUser(payload); // Changed 'res' to 'result'

    if (result.success) {
      toast.success(result.message || "User invited successfully!");
      // Reset form
      setFormData(
        formFields.reduce(
          (acc, field) => {
            acc[field.id] = "";
            return acc;
          },
          { type: "" }
        )
      );
    } else {
      if (result.code === "DUPLICATE_EMAIL") {
        toast.error(result.error, {
          duration: 5000,
        });
      } else {
        toast.error(result.error);
      }
    }
    
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-blue-50 p-6 rounded-lg shadow-lg"
      aria-labelledby="waitlist-heading"
    >
      <h2 id="waitlist-heading" className="sr-only">
        Register your business or taxi to the waitlist
      </h2>

      {/* Business/Taxi selector */}
      <fieldset className="space-y-2">
        <legend className="block font-medium text-gray-700 mb-1">
          Are you a Business or a Taxi? <span className="text-red-500">*</span>
        </legend>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="type"
              value="CARE"
              checked={formData.type === "CARE"}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
              disabled={loading}
            />
            <span>Business</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="type"
              value="TAXI"
              checked={formData.type === "TAXI"}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
              disabled={loading}
            />
            <span>Taxi</span>
          </label>
        </div>
      </fieldset>

      {/* Existing fields */}
      {formFields.map(({ id, label, type, required }) => (
        <div key={id}>
          <label htmlFor={id} className="block font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {type === "textarea" ? (
            <textarea
              id={id}
              required={required}
              aria-required={required}
              aria-label={label}
              rows={4}
              className="w-full border bg-white border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData[id]}
              onChange={handleChange}
              disabled={loading}
            />
          ) : (
            <input
              id={id}
              type={type}
              required={required}
              aria-required={required}
              aria-label={label}
              className="w-full border bg-white border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData[id]}
              onChange={handleChange}
              disabled={loading}
            />
          )}
        </div>
      ))}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-800 transition mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Submit your registration form"
      >
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
};

export default WaitlistForm;