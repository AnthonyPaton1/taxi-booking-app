"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; 

export default function BidCard({ onSubmit }) {
  const [formData, setFormData] = useState({
    priceType: "exact", // "exact" or "estimate"
    exactPrice: "",
    estimateMin: "",
    estimateMax: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.priceType === "exact") {
      if (!formData.exactPrice || formData.exactPrice <= 0) {
        newErrors.exactPrice = "Enter a valid exact price.";
      }
    }

    if (formData.priceType === "estimate") {
      if (!formData.estimateMin || !formData.estimateMax) {
        newErrors.estimateMin = "Enter estimate min and max.";
      } else if (formData.estimateMin > formData.estimateMax) {
        newErrors.estimateMax = "Max should be greater than min.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit?.(formData);
    alert("Bid submitted!");
    // Optionally reset form or redirect
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg shadow-md p-6 max-w-xl mx-auto space-y-6"
    >
      <h2 className="text-xl font-bold text-blue-700 mb-4">Submit a Bid</h2>

      {/* Price Type Toggle */}
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="priceType"
            value="exact"
            checked={formData.priceType === "exact"}
            onChange={handleChange}
            className="mr-2"
          />
          Exact Price
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="priceType"
            value="estimate"
            checked={formData.priceType === "estimate"}
            onChange={handleChange}
            className="mr-2"
          />
          Estimated Price
        </label>
      </div>

      {/* Conditional Inputs */}
      {formData.priceType === "exact" && (
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Exact Price (£)
          </label>
          <input
            type="number"
            name="exactPrice"
            value={formData.exactPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="0"
            step="0.01"
          />
          {errors.exactPrice && (
            <p className="text-red-600 text-sm mt-1">{errors.exactPrice}</p>
          )}
        </div>
      )}

      {formData.priceType === "estimate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Estimate Min (£)
            </label>
            <input
              type="number"
              name="estimateMin"
              value={formData.estimateMin}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
            {errors.estimateMin && (
              <p className="text-red-600 text-sm mt-1">{errors.estimateMin}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Estimate Max (£)
            </label>
            <input
              type="number"
              name="estimateMax"
              value={formData.estimateMax}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
            {errors.estimateMax && (
              <p className="text-red-600 text-sm mt-1">{errors.estimateMax}</p>
            )}
          </div>
        </div>
      )}

      {/* Optional message */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Optional Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="Any details about this bid?"
        />
      </div>

      <Button type="submit" className="w-full bg-blue-700 text-white">
        Submit Bid
      </Button>
    </form>
  );
}