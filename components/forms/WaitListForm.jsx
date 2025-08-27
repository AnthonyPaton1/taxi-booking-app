// components/forms/WaitlistForm.jsx
"use client";

import React, { useState } from "react";
import formFields from "./formFields";
import { Button } from "@/components/ui/button"; // ShadCN button
import { sendContactEmail } from "@/app/actions/sendContactEmail"; // Your server action

const WaitlistForm = () => {
  const [formData, setFormData] = useState(
    formFields.reduce((acc, field) => {
      acc[field.id] = "";
      return acc;
    }, {})
  );

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await sendContactEmail(formData);
    if (res.success) {
      setStatus("Message sent successfully!");
      setFormData(
        formFields.reduce((acc, field) => {
          acc[field.id] = "";
          return acc;
        }, {})
      );
    } else {
      setStatus("Something went wrong. Please try again later.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-blue-50 p-6 rounded-lg shadow-lg"
    >
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
              rows={4}
              className="w-full border bg-white border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData[id]}
              onChange={handleChange}
            />
          ) : (
            <input
              id={id}
              type={type}
              required={required}
              className="w-full border bg-white border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData[id]}
              onChange={handleChange}
            />
          )}
        </div>
      ))}

      <Button
        type="submit"
        className="w-full bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-800 transition"
      >
        Join Waitlist
      </Button>

      {status && (
        <p className="text-sm mt-2 text-center text-gray-700">{status}</p>
      )}
    </form>
  );
};

export default WaitlistForm;
