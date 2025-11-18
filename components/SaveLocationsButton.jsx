"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * SaveLocationButton
 * 
 * Quick button to save a location while creating a booking
 * Props:
 * - address: The address to save
 * - postcode: The postcode to save
 * - suggestedName: Optional suggested name (e.g. from previous bookings)
 * - onSaved: Callback after successfully saving
 */
export default function SaveLocationButton({
  address,
  postcode,
  suggestedName = "",
  onSaved,
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState(suggestedName);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/saved-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          postcode: postcode.toUpperCase(),
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowDialog(false);
        setName("");
        setNotes("");
        if (onSaved) onSaved(data.savedLocation);
      } else {
        setError(data.error || "Failed to save location");
      }
    } catch (err) {
      console.error("Error saving location:", err);
      setError("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  if (!address || !postcode) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setShowDialog(true)}
        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
      >
        <Star className="w-4 h-4 mr-2" />
        Save Location
      </Button>

      {/* Simple Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Save Location
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 rounded p-2 border border-gray-200">
                  {address}
                  <br />
                  <span className="font-medium">{postcode}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. St Mary's Care Home"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Use side entrance"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save Location"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}