"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";

const OnboardingManager = ({ managerEmail, name, area }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [houses, setHouses] = useState([
    {
      label: "",
      line1: "",
      city: "",
      postcode: "",
      notes: "",
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
      { label: "", line1: "", city: "", postcode: "", notes: "" },
    ]);
  };

  const removeHouse = (index) => {
    setHouses(houses.filter((_, i) => i !== index));
  };

  const isValid = houses.every(
    (h) => h.label && h.line1 && h.city && h.postcode
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
      
      // Step 1: Validate all house postcodes and get coordinates
      toast.loading("Verifying house postcodes...");
      
      const validatedHouses = [];
      
      for (let i = 0; i < houses.length; i++) {
        const house = houses[i];
        
        const postcodeValidation = await fetch("/api/validate-postcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postcode: house.postcode }),
        });

        const postcodeData = await postcodeValidation.json();

        // Check BOTH response.ok AND data.valid
        if (!postcodeValidation.ok || !postcodeData.valid) {
          toast.dismiss();
          toast.error(`Property ${i + 1}: ${postcodeData.error || "Postcode not found"}`, {
            duration: 5000,
          });
          
          // Scroll to the invalid house postcode field
          setTimeout(() => {
            const postcodeField = document.getElementById(`house-postcode-${i}`);
            if (postcodeField) {
              postcodeField.scrollIntoView({ 
                behavior: "smooth", 
                block: "center" 
              });
              postcodeField.focus();
            }
          }, 100);
          
          setSubmitting(false);
          return;
        }

        // Add validated house with coordinates
        validatedHouses.push({
          ...house,
          postcode: postcodeData.coordinates.postcode, // Normalized
          lat: postcodeData.coordinates.lat,            // Float
          lng: postcodeData.coordinates.lng,            // Float
        });
      }

      toast.dismiss();
      toast.loading("Submitting houses...");

      // Step 2: Submit with validated houses
      const payload = { 
        managerEmail, 
        name, 
        area, 
        houses: validatedHouses,
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

      toast.dismiss();
      toast.success("Houses onboarded successfully!");
      setTimeout(() => router.push("/dashboard/manager"), 1200);
      
    } catch (err) {
      toast.dismiss();
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
                placeholder="House Label (e.g., Main House, Oak Villa) *"
                value={house.label}
                onChange={(e) => handleHouseChange(i, "label", e.target.value)}
                required
              />
              <Input
                placeholder="Address Line 1 (e.g., 123 Main Street) *"
                value={house.line1}
                onChange={(e) => handleHouseChange(i, "line1", e.target.value)}
                required
              />
              <Input
                placeholder="City or Town *"
                value={house.city}
                onChange={(e) => handleHouseChange(i, "city", e.target.value)}
                required
              />
              
              {/* UPDATED POSTCODE INPUT */}
              <PostcodeInput
                id={`house-postcode-${i}`}
                value={house.postcode}
                onChange={(value) => handleHouseChange(i, "postcode", value)}
                label="Postcode"
                placeholder="e.g., SK3 0AA"
                required
              />
              
              <Textarea
                placeholder="Notes (optional - any additional information)"
                value={house.notes}
                onChange={(e) => handleHouseChange(i, "notes", e.target.value)}
                rows={2}
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