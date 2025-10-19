"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import { removeUser } from "@/app/actions/removeUser";

const EditDetailsPage = () => {
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState([]);
  const [removing, setRemoving] = useState(null); // Track which coordinator is being removed
  const [formData, setFormData] = useState({
    companyId: "",
    businessName: "",
    address1: "",
    city: "",
    postcode: "",
    website: "",
    contactNumber: "",
    contactEmail: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/edit-details/admin");
        const data = await res.json();

        setFormData({
          companyId: data.companyId || "",
          businessName: data.businessName || "",
          address1: data.address1 || "",
          city: data.city || "",
          postcode: data.postcode || "",
          website: data.website || "",
          contactNumber: data.contactNumber || "",
          contactEmail: data.contactEmail || "",
        });

        setCoordinators(data.coordinators || []);
      } catch (err) {
        console.error("❌ Failed to fetch edit data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCoordinatorChange = (index, field, value) => {
    const updated = [...coordinators];
    updated[index][field] = value;
    setCoordinators(updated);
  };

  const addCoordinator = () => {
    setCoordinators((prev) => [
      ...prev,
      { name: "", email: "", phone: "", area: "", isNew: true }, // Mark as new
    ]);
  };

  const handleRemove = async (index) => {
    const coordinator = coordinators[index];
    
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to remove ${coordinator.name || "this coordinator"}?\n\n${
        coordinator.id 
          ? "This will permanently delete their account and all associated data.\n" 
          : "This will remove them from the form.\n"
      }This action cannot be undone.`
    );

    if (!confirmed) return;

    // If this is a NEW coordinator (not saved to DB yet), just remove from state
    if (coordinator.isNew || !coordinator.id) {
      setCoordinators((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // If this is an EXISTING coordinator (has ID), delete from database
    setRemoving(index);

    try {
      const result = await removeUser(coordinator.id);

      if (result.success) {
        // Remove from local state after successful deletion
        setCoordinators((prev) => prev.filter((_, i) => i !== index));
        alert(`✅ ${coordinator.name || coordinator.email} has been removed successfully`);
      } else {
        alert(`❌ Failed to remove coordinator: ${result.error}`);
      }
    } catch (error) {
      console.error("Error removing coordinator:", error);
      alert("❌ An error occurred while removing the coordinator. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = { ...formData, coordinators };
      const res = await fetch("/api/edit-details/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Update failed:", errorText);
        throw new Error("Failed to update");
      }

      const data = await res.json();
      console.log("✅ Update response:", data);

      alert("Details updated successfully");
      
      // Optionally refresh the data to get updated coordinator IDs
      window.location.reload();
    } catch (err) {
      console.error("Update failed", err);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Edit Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-700">Business Information</h3>
            
            <Input
              id="businessName"
              placeholder="Business Name"
              required
              value={formData.businessName}
              onChange={handleChange}
              aria-label="Business Name"
            />
            <Input
              id="address1"
              placeholder="Address Line 1"
              required
              value={formData.address1}
              onChange={handleChange}
              aria-label="Address Line 1"
            />
            <Input
              id="city"
              placeholder="City"
              required
              value={formData.city}
              onChange={handleChange}
              aria-label="City"
            />
            <Input
              id="postcode"
              placeholder="Postcode"
              required
              value={formData.postcode}
              onChange={handleChange}
              aria-label="Postcode"
            />
            <Input
              id="website"
              placeholder="Website URL"
              required
              value={formData.website}
              onChange={handleChange}
              aria-label="Business Website"
            />
            <Input
              id="contactNumber"
              placeholder="Business Contact Number"
              required
              value={formData.contactNumber}
              onChange={handleChange}
              aria-label="Contact Number"
            />
            <Input
              id="contactEmail"
              type="email"
              placeholder="Business Contact Email"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              aria-label="Contact Email"
            />
          </div>

          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Coordinators ({coordinators.length})
            </h3>

            {coordinators.map((coord, i) => (
              <div key={coord.id || i} className="border p-4 rounded-md bg-gray-50 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Coordinator {i + 1}
                    {coord.isNew && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </span>
                  
                  {coordinators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      disabled={removing === i}
                      className={`text-red-600 hover:underline text-sm ${
                        removing === i ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {removing === i ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>

                <Textarea
                  placeholder="Areas covered (e.g., LS1, LS2, LS3)"
                  value={coord.area || ""}
                  onChange={(e) =>
                    handleCoordinatorChange(i, "area", e.target.value)
                  }
                  rows={2}
                />
                <Input
                  placeholder="Coordinator Name"
                  value={coord.name || ""}
                  onChange={(e) =>
                    handleCoordinatorChange(i, "name", e.target.value)
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Coordinator Email"
                  value={coord.email || ""}
                  onChange={(e) =>
                    handleCoordinatorChange(i, "email", e.target.value)
                  }
                  required
                />
                <Input
                  placeholder="Coordinator Phone Number"
                  value={coord.phone || ""}
                  onChange={(e) =>
                    handleCoordinatorChange(i, "phone", e.target.value)
                  }
                />
              </div>
            ))}

            <Button 
              type="button" 
              variant="outline" 
              onClick={addCoordinator}
              className="w-full"
            >
              + Add Another Coordinator
            </Button>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditDetailsPage;
