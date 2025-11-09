"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck, AlertCircle } from "lucide-react";

export default function ReassignHouseForm({ house, managers, currentManagerId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedManagerId) {
      setError("Please select a manager");
      return;
    }

    if (!confirm(`Reassign ${house.label} to ${managers.find(m => m.id === selectedManagerId)?.name}?`)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/coordinator/houses/${house.id}/reassign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newManagerId: selectedManagerId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reassign house");
      }

      router.push("/dashboard/coordinator/houses");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select New Manager <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedManagerId}
          onChange={(e) => setSelectedManagerId(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a manager...</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name} ({manager.housesCount} house{manager.housesCount !== 1 ? "s" : ""})
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">
          This will transfer management of {house.label} and all {house.residents.length} residents to the selected manager.
        </p>
      </div>

      {selectedManagerId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> {house.label} will be transferred from{" "}
            <strong>{managers.find(m => m.id === currentManagerId)?.name || "current manager"}</strong> to{" "}
            <strong>{managers.find(m => m.id === selectedManagerId)?.name}</strong>
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !selectedManagerId}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Reassigning...
            </>
          ) : (
            <>
              <UserCheck className="w-5 h-5" />
              Reassign House
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}