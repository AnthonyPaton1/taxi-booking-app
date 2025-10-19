"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const OnboardingManager = ({ managerEmail, name, area }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [houses, setHouses] = useState([
    {
      number: "",
      street: "",
      city: "",
      postcode: "",
      tenants: "",
    },
  ]);

  const handleHouseChange = (index, field, value) => {
    const updated = [...houses];
    updated[index][field] = value;
    setHouses(updated);
  };

  const addHouse = () => {
    setHouses([
      ...houses,
      { number: "", street: "", city: "", postcode: "", tenants: "" },
    ]);
  };

  const removeHouse = (index) => {
    setHouses(houses.filter((_, i) => i !== index));
  };

  const isValid = houses.every(
    (h) => h.number && h.street && h.postcode && h.tenants
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!managerEmail || !name) {
      toast.error("Missing manager info. Please try again.");
      return;
    }

    if (!isValid) {
      toast.error("Please complete all required fields.");
      return;
    }
    
    try {
      setSubmitting(true);
      const payload = { 
        managerEmail, 
        name, 
        area, 
        houses 
      };

      const res = await fetch("/api/onboarding/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Submission failed");
      }

      toast.success("Houses onboarded successfully!");
      setTimeout(() => router.push("/dashboard/manager"), 1200);
    } catch (err) {
      console.error("Onboarding failed:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Onboard Your Houses
      </h2>

      {/* Show area for reference only */}
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Your Area:</span> {area || "Not specified"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Houses Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
          
          {houses.map((house, i) => (
            <div
              key={i}
              className="border p-4 rounded-md bg-gray-50 space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">
                  Property {i + 1}
                </span>
                {houses.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeHouse(i)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <Input
                placeholder="House Number *"
                value={house.number}
                onChange={(e) => handleHouseChange(i, "number", e.target.value)}
                required
              />
              <Input
                placeholder="Street Name *"
                value={house.street}
                onChange={(e) => handleHouseChange(i, "street", e.target.value)}
                required
              />
              <Input
                placeholder="City or Town (optional)"
                value={house.city}
                onChange={(e) => handleHouseChange(i, "city", e.target.value)}
              />
              <Input
                placeholder="Postcode *"
                value={house.postcode}
                onChange={(e) => handleHouseChange(i, "postcode", e.target.value)}
                required
              />
              <Textarea
                placeholder="Tenant initials (e.g. JD, ML) *"
                value={house.tenants}
                onChange={(e) => handleHouseChange(i, "tenants", e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={addHouse}>
            + Add Another House
          </Button>
          <Button
            type="submit"
            disabled={submitting || !isValid}
            className="bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingManager;