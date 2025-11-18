"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, MapPin, Calendar } from "lucide-react";

/**
 * SavedLocationsManager - Coordinator Dashboard Component
 * Allows coordinators to manage their frequently used locations
 */
export default function SavedLocationsManager() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    postcode: "",
    notes: "",
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/saved-locations");
      const data = await res.json();
      
      if (res.ok) {
        setLocations(data.savedLocations || []);
      } else {
        setError(data.error || "Failed to load locations");
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingId 
        ? `/api/saved-locations/${editingId}`
        : "/api/saved-locations";
      
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", address: "", postcode: "", notes: "" });
        fetchLocations();
      } else {
        setError(data.error || "Failed to save location");
      }
    } catch (err) {
      console.error("Error saving location:", err);
      setError("Failed to save location");
    }
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name,
      address: location.address,
      postcode: location.postcode,
      notes: location.notes || "",
    });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      const res = await fetch(`/api/saved-locations/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Location deleted successfully");
        fetchLocations();
      } else {
        setError(data.error || "Failed to delete location");
      }
    } catch (err) {
      console.error("Error deleting location:", err);
      setError("Failed to delete location");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", address: "", postcode: "", notes: "" });
    setError(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500">Loading saved locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Saved Locations</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage frequently used pickup and dropoff locations for faster booking
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Location" : "Add New Location"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. St Mary's Care Home"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode *
                </label>
                <input
                  type="text"
                  placeholder="M1 1AA"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="e.g. Use side entrance, Call on arrival"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editingId ? "Update Location" : "Save Location"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Locations List */}
        <div className="space-y-3">
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved locations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Save care homes, day centres, hospitals and other frequently used locations to speed up booking
              </p>
            </div>
          ) : (
            locations.map((location) => (
              <div
                key={location.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {location.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {location.address}
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {location.postcode}
                        </p>
                        {location.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            Note: {location.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Used {location.useCount} times</span>
                          {location.lastUsed && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Last used: {new Date(location.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(location)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit location"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}