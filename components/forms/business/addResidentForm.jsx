"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";
import { ArrowLeft, User, FileText } from "lucide-react";

export default function AddResidentForm({ house }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    initials: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-uppercase initials
    if (name === "initials") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    // Validation
    if (!formData.name.trim()) {
      setStatus("❌ Name is required");
      return;
    }

    if (!formData.initials.trim()) {
      setStatus("❌ Initials are required");
      return;
    }

    if (formData.initials.length > 4) {
      setStatus("❌ Initials should be 2-4 characters (e.g., JD, MS, ABC)");
      return;
    }

    // Check for duplicate initials in this house
    const duplicate = house.residents.find(
      (r) => r.initials.toUpperCase() === formData.initials.toUpperCase()
    );

    if (duplicate) {
      setStatus(
        `❌ Initials "${formData.initials}" already used by ${duplicate.name}. Please use different initials.`
      );
      return;
    }

    try {
      const res = await fetch("/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseId: house.id,
          name: formData.name.trim(),
          initials: formData.initials.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("✅ Resident added successfully!");
        setTimeout(() => {
          router.push("/dashboard/manager/houses");
          router.refresh();
        }, 1000);
      } else {
        setStatus("❌ " + (data.error || "Failed to add resident"));
      }
    } catch (err) {
      console.error("Error adding resident:", err);
      setStatus("❌ Something went wrong");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/manager/houses"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Houses
        </Link>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Add New Resident</h1>
          <p className="text-gray-600 mt-2">
            Adding resident to <span className="font-semibold">{house.label}</span>
          </p>
        </div>
      </div>

      <StatusMessage
        message={status}
        type={status?.startsWith("❌") ? "error" : "info"}
      />

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Privacy Notice</h3>
        <p className="text-sm text-blue-800">
          We only store minimal information for privacy and GDPR compliance:
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
          <li>Display name (e.g., "John", "Resident 1")</li>
          <li>Initials (for invoices and audit trails only)</li>
        </ul>
        <p className="text-sm text-blue-800 mt-2">
          No sensitive data like DOB, NHS numbers, or medical information is stored.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="name" className="flex items-center font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            Resident Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., John, Mary, Resident 1"
            maxLength={100}
          />
          <p className="text-sm text-gray-500 mt-1">
            Use first name or a simple identifier (not full legal name)
          </p>
        </div>

        <div>
          <label htmlFor="initials" className="flex items-center font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            Initials * (for invoicing)
          </label>
          <input
            type="text"
            id="initials"
            name="initials"
            required
            value={formData.initials}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="e.g., JD, MS, ABC"
            maxLength={4}
          />
          <p className="text-sm text-gray-500 mt-1">
            2-4 characters used for invoices and audit trails. Must be unique per house.
          </p>
          
          {/* Show existing initials */}
          {house.residents.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Existing initials in this house:
              </p>
              <div className="flex flex-wrap gap-2">
                {house.residents.map((resident) => (
                  <span
                    key={resident.id}
                    className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                  >
                    {resident.initials} ({resident.name})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Adding Resident..." : "Add Resident"}
          </Button>
          <Link
            href="/dashboard/manager/houses"
            className="flex-1 text-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}