// app/dashboard/admin/onboarding.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Onboarding = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    addressLine1: "",
    city: "",
    postcode: "",
    website: "",
    contactNumber: "",
    contactEmail: "",
    areasCovered: "",
    coordinatorName: "",
    coordinatorEmail: "",
    coordinatorPhone: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Submitted successfully!");
      } else {
        alert("Something went wrong.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
        <Textarea
          id="areasCovered"
          placeholder="Areas covered (e.g., LS1, LS2)"
          required
          value={formData.areasCovered}
          onChange={handleChange}
          aria-label="Areas Covered"
        />
        <Input
          id="coordinatorName"
          placeholder="Coordinator Name"
          required
          value={formData.coordinatorName}
          onChange={handleChange}
          aria-label="Coordinator Name"
        />
        <Input
          id="coordinatorEmail"
          type="email"
          placeholder="Coordinator Email"
          required
          value={formData.coordinatorEmail}
          onChange={handleChange}
          aria-label="Coordinator Email"
        />
        <Input
          id="coordinatorPhone"
          placeholder="Coordinator Phone Number"
          required
          value={formData.coordinatorPhone}
          onChange={handleChange}
          aria-label="Coordinator Phone"
        />

        <Button
          type="submit"
          className="w-full bg-blue-700 text-white hover:bg-blue-800"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Onboarding;
