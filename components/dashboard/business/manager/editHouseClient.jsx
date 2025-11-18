"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";

export default function EditHouseClient({ house }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    label: house.label || "",
    line1: house.line1 || "",
    city: house.city || "",
    postcode: house.postcode || "",
    notes: house.notes || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      toast.loading("Verifying postcode...");
      
      const postcodeValidation = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: formData.postcode }),
      });

      const postcodeData = await postcodeValidation.json();

      // Check BOTH response.ok AND data.valid
      if (!postcodeValidation.ok || !postcodeData.valid) {
        toast.dismiss();
        toast.error(postcodeData.error || "Postcode not found", {
          duration: 5000,
        });
        
        // Scroll to postcode field
        setTimeout(() => {
          const postcodeField = document.getElementById("house-postcode");
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

      toast.dismiss();
      toast.loading("Updating house...");

      // Step 2: Update house with validated postcode and coordinates
      const payload = {
        label: formData.label,
        line1: formData.line1,
        city: formData.city,
        postcode: postcodeData.coordinates.postcode, // Normalized
        lat: postcodeData.coordinates.lat,            // Float
        lng: postcodeData.coordinates.lng,            // Float
        notes: formData.notes || null,
      };

      const response = await fetch(`/api/manager/houses/${house.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update house");
      }

      toast.dismiss();
      toast.success("House updated successfully!");
      
      setTimeout(() => {
        router.push("/dashboard/manager/houses");
        router.refresh();
      }, 1000);
      
    } catch (error) {
      toast.dismiss();
      console.error("Update error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          House Label *
        </label>
        <Input
          value={formData.label}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="e.g., Main House, Oak Villa"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 *
        </label>
        <Input
          value={formData.line1}
          onChange={(e) => handleChange("line1", e.target.value)}
          placeholder="e.g., 123 Main Street"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City *
        </label>
        <Input
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="e.g., Stockport"
          required
        />
      </div>

      <div>
        <PostcodeInput
          id="house-postcode"
          value={formData.postcode}
          onChange={(value) => handleChange("postcode", value)}
          label="Postcode"
          placeholder="e.g., SK3 0AA"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Any additional notes about this property (optional)"
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? "Updating..." : "Update House"}
        </Button>
      </div>
    </form>
  );
}