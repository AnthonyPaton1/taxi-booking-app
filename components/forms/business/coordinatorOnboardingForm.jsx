"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CoordinatorOnboardingForm({ companyId, coordinatorArea }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [managers, setManagers] = useState([
    {
      name: "",
      email: "",
      phone: "",
      area: coordinatorArea || "", // Pre-filled from coordinator's area
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
      { 
        name: "", 
        email: "", 
        phone: "", 
        area: coordinatorArea || "" // Pre-fill for new managers too
      },
    ]);
  };

  const removeManager = (index) => {
    setManagers(managers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/coordinator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          managers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Managers onboarded successfully!");
        
        // Show email results if any failed
        if (data.emailResults) {
          const failed = data.emailResults.filter(r => !r.success);
          if (failed.length > 0) {
            toast.warning(`${failed.length} invitation email(s) failed to send`, {
              description: "You can resend invitations from your dashboard"
            });
          }
        }
        
        router.refresh();
      } else {
        toast.error(data.error || "Failed to onboard managers");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Manager Onboarding
      </h2>
      <p className="text-gray-600 mb-6">
        Add your managers and invite them to the App
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {managers.map((manager, i) => (
          <div key={i} className="border p-4 rounded-md bg-gray-50 space-y-4">
            {/* Area - Pre-filled and Read-only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local Office / Area
              </label>
              <Input
                value={manager.area}
                readOnly
                disabled
                className="bg-gray-100 cursor-not-allowed"
                placeholder="Area"
              />
              <p className="text-xs text-gray-500 mt-1">
                Managers will be assigned to your area: {coordinatorArea}
              </p>
            </div>

            {/* Manager Name */}
            <Input
              placeholder="Manager Name"
              value={manager.name}
              onChange={(e) =>
                handleManagerChange(i, "name", e.target.value)
              }
              required
            />

            {/* Manager Email */}
            <Input
              type="email"
              placeholder="Manager Email"
              value={manager.email}
              onChange={(e) =>
                handleManagerChange(i, "email", e.target.value)
              }
              required
            />

            {/* Manager Phone */}
            <div>
              <Input
                id={`manager-phone-${i}`}
                placeholder="Manager Phone Number"
                value={manager.phone}
                onChange={(e) =>
                  handleManagerChange(i, "phone", e.target.value)
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                UK format: e.g. 07123456789 or +447123456789
              </p>
            </div>

            {/* Remove Button */}
            {managers.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeManager(i)}
              >
                Remove Manager
              </Button>
            )}
          </div>
        ))}

        {/* Add Another Manager */}
        <Button
          type="button"
          variant="outline"
          onClick={addManager}
          className="w-full"
        >
          + Add Another Manager
        </Button>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Onboarding Managers..." : "Complete Manager Onboarding"}
        </Button>
      </form>
    </div>
  );
}