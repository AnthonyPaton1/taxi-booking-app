"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import { toast } from "sonner";


const OnboardingCoord = ({companyId}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [managers, setManagers] = useState([
    {
      name: "",
      email: "",
      phone: "",
      area: "",
    },
  ]);



  const handleManagerChange = (index, field, value) => {
    const updated = [...managers];
    updated[index][field] = value;
    setManagers(updated);
  };

  const addManager = () => {
    setManagers([
      ...managers,
      { name: "", email: "", phone: "", house: "" },
    ]);
  };

  const removeManager = (index) => {
    setManagers(managers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setSubmitting(true);
      const payload = { companyId, managers };
      console.log("Submitting payload:", payload);
      const res = await fetch("/api/onboarding/coordinator", {
        method: "POST", // or "POST" if it’s a new form
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      if (res.ok) {
        await fetch("/api/invite-manager", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ managers }),
});
  toast.success("Updated successfully! Redirecting...");
  setTimeout(() => router.push("/dashboard/coordinator"), 1000);

}


      // ✅ Redirect to dashboard (adjust path if needed)
      
    } catch (err) {
      console.error("Update failed", err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = managers.every(m => m.name && m.email && m.phone);
if (!isValid) {
  toast.error("Please fill out all manager fields.");
  return;
  
}

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Manager Onboarding
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        

          {managers.map((coord, i) => (
            <div key={i} className="border p-4 rounded-md bg-gray-50 space-y-4">
              <Textarea
                placeholder="Area covered (e.g., LS1, LS2)"
                value={coord.area}
                onChange={(e) =>
                  handleManagerChange(i, "area", e.target.value)
                }
              />
              <Input
                placeholder="Manager Name"
                value={coord.name}
                onChange={(e) =>
                  handleManagerChange(i, "name", e.target.value)
                }
              />
              <Input
                type="email"
                placeholder="Manager Email"
                value={coord.email}
                onChange={(e) =>
                  handleManagerChange(i, "email", e.target.value)
                }
              />
              <Input
                placeholder="Manager Phone Number"
                value={coord.phone}
                onChange={(e) =>
                  handleManagerChange(i, "phone", e.target.value)
                }
              />

              {managers.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeManager(i)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={addManager}>
              + Add Another Manager
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

export default OnboardingCoord;