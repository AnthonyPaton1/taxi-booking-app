"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

const OnboardingManager = ({ managerId }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [houses, setHouses] = useState([
    {
      number: "",
      street: "",
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
      { number: "", street: "", postcode: "", tenants: "" },
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

    if (!isValid) {
      toast.error("Please complete all fields for each house.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = { managerId, houses };

      const res = await fetch("/api/onboarding/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      toast.success("Houses onboarded successfully!");
      setTimeout(() => router.push("/dashboard/manager"), 1200);
    } catch (err) {
      console.error("Onboarding failed:", err);
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
     
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Onboard Your Houses
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {houses.map((house, i) => (
            <div
              key={i}
              className="border p-4 rounded-md bg-gray-50 space-y-4"
            >
              <Input
                placeholder="House Number"
                value={house.number}
                onChange={(e) => handleHouseChange(i, "number", e.target.value)}
              />
              <Input
                placeholder="Street Name"
                value={house.street}
                onChange={(e) => handleHouseChange(i, "street", e.target.value)}
              />
              <Input
                placeholder="Postcode"
                value={house.postcode}
                onChange={(e) =>
                  handleHouseChange(i, "postcode", e.target.value)
                }
              />
              <Textarea
                placeholder="Initials of Tenants (e.g., JD, ML)"
                value={house.tenants}
                onChange={(e) =>
                  handleHouseChange(i, "tenants", e.target.value)
                }
              />
              {houses.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeHouse(i)}
                >
                  Remove House
                </Button>
              )}
            </div>
          ))}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={addHouse}>
              + Add Another House
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OnboardingManager;