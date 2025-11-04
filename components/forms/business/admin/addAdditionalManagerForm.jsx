// components/dashboard/coordinator/AddManagerForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";
import { toast } from "sonner";

export default function AddManagerForm({ businessId, coordinatorArea, houses }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    houseIds: [], // Multiple houses
  });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHouseSelection = (houseId) => {
    setFormData((prev) => ({
      ...prev,
      houseIds: prev.houseIds.includes(houseId)
        ? prev.houseIds.filter((id) => id !== houseId)
        : [...prev.houseIds, houseId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setSubmitting(true);

    try {
      const res = await fetch("/api/coordinator/managers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          houseIds: formData.houseIds,
          area: coordinatorArea, // Pass coordinator's area
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Manager added successfully! Email invitation sent.");
        toast.success("Manager added and invited!");
        setTimeout(() => {
          router.push("/dashboard/coordinator/managers");
        }, 2000);
      } else {
        setStatus("❌ " + (data.error || "Failed to add manager"));
        toast.error(data.error || "Failed to add manager");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error adding manager:", error);
      setStatus("❌ Something went wrong");
      toast.error("Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/coordinator/managers"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Managers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Add New Manager
        </h1>
        <p className="text-gray-600 mb-6">
          Managers oversee day-to-day operations for their assigned houses
        </p>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sarah Johnson"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sarah@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              They'll receive an invitation email to set up their account
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={submitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="07123456789"
            />
          </div>

          {/* House Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Houses (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              You can assign houses now, or the manager can add them during onboarding
            </p>

            {houses.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                No houses available. Please create houses first before adding managers.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {houses.map((house) => (
                  <label
                    key={house.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.houseIds.includes(house.id)}
                      onChange={() => handleHouseSelection(house.id)}
                      disabled={submitting}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{house.name}</p>
                      <p className="text-sm text-gray-600">
                        {house.label1} {house.postcode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {formData.houseIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {formData.houseIds.length} house{formData.houseIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={() => router.push("/dashboard/coordinator/managers")}
              variant="outline"
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Adding Manager..." : "Add Manager"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}