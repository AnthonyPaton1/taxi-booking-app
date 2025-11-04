// components/dashboard/admin/EditAreaForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusMessage from "@/components/shared/statusMessage";
import { toast } from "sonner";

export default function EditAreaForm({ area }) {
  const [formData, setFormData] = useState({
    name: area.name || "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/areas/${area.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Area updated successfully!");
        toast.success("Area updated!");
        setTimeout(() => {
          router.push("/dashboard/admin/areas");
        }, 1500);
      } else {
        setStatus("❌ " + (data.error || "Failed to update area"));
        toast.error(data.error || "Failed to update area");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error updating area:", error);
      setStatus("❌ Something went wrong");
      toast.error("Something went wrong");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (area._count.users > 0 || area._count.house > 0) {
      toast.error(
        "Cannot delete area with active coordinators or houses. Please reassign them first."
      );
      return;
    }

    if (
      !confirm(
        `Delete "${area.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setStatus("loading");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/areas/${area.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Area deleted!");
        router.push("/dashboard/admin/areas");
      } else {
        setStatus("❌ " + (data.error || "Failed to delete area"));
        toast.error(data.error || "Failed to delete area");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      setStatus("❌ Something went wrong");
      toast.error("Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/admin/areas"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Areas
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Area</h1>
        <p className="text-gray-600 mb-6">
          Update area name or remove the area
        </p>

        {/* Area Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Current Usage</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{area._count.users}</p>
                <p className="text-sm text-gray-600">
                  Coordinator{area._count.users !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Home className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{area._count.house}</p>
                <p className="text-sm text-gray-600">
                  House{area._count.house !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          {(area._count.users > 0 || area._count.house > 0) && (
            <p className="text-sm text-amber-700 mt-3 bg-amber-50 p-2 rounded">
              ⚠️ This area is in use and cannot be deleted
            </p>
          )}
        </div>

        <StatusMessage
          message={status}
          type={status?.startsWith("❌") ? "error" : "info"}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Area Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., North Manchester"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={() => router.push("/dashboard/admin/areas")}
              variant="outline"
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {(area._count.users === 0 && area._count.house === 0) && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                variant="destructive"
                className="flex-1"
              >
                {submitting ? "Deleting..." : "Delete Area"}
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}