"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { toast } from "sonner";
import { Eye, EyeOff, Info } from "lucide-react";

const OnboardingManager = ({ managerEmail, name, area }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  const [houses, setHouses] = useState([
    {
      label: "",
      line1: "",
      city: "",
      postcode: "",
      notes: "",
      username: "", 
      password: "", 
      confirmPassword: "", 
    },
  ]);

  const handleHouseChange = (index, field, value) => {
    const updated = [...houses];
    updated[index][field] = value;
    setHouses(updated);
  };

  const togglePasswordVisibility = (index) => {
    setShowPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addHouse = () => {
    setHouses([
      ...houses,
      { 
        label: "", 
        line1: "", 
        city: "", 
        postcode: "", 
        notes: "",
        username: "", // FIXED: was userName
        password: "",
        confirmPassword: "",
      },
    ]);
  };

  const removeHouse = (index) => {
    setHouses(houses.filter((_, i) => i !== index));
    const newShowPasswords = { ...showPasswords };
    delete newShowPasswords[index];
    setShowPasswords(newShowPasswords);
  };

  // NEW: Password validation helper
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  // NEW: Username validation helper
  const validateUsername = (username) => {
    const isValidFormat = /^[a-z0-9-]+$/.test(username);
    return username.length >= 6 && username.length <= 20 && isValidFormat;
  };

  // UPDATED: Enhanced validation
  const validateHouses = () => {
    // Check all required fields
    const allFieldsComplete = houses.every(
      (h) => h.label && h.line1 && h.city && h.postcode && h.username && h.password && h.confirmPassword
    );

    if (!allFieldsComplete) {
      return { valid: false, error: "Please complete all required fields" };
    }

    // Check username and password requirements
    for (let i = 0; i < houses.length; i++) {
      const house = houses[i];
      
      // Validate username format
      if (!validateUsername(house.username)) {
        return { 
          valid: false, 
          error: `Property ${i + 1}: Username must be 6-20 characters (lowercase letters, numbers, hyphens only)`,
          houseIndex: i
        };
      }
      
      // Validate password complexity
      if (!validatePassword(house.password)) {
        return { 
          valid: false, 
          error: `Property ${i + 1}: Password must be at least 8 characters with uppercase, lowercase, number, and special character`,
          houseIndex: i
        };
      }

      if (house.password !== house.confirmPassword) {
        return { 
          valid: false, 
          error: `Property ${i + 1}: Passwords do not match`,
          houseIndex: i
        };
      }
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!managerEmail || !name) {
      toast.error("Missing manager info. Please try again.");
      return;
    }

    // Validate houses including passwords
    const validation = validateHouses();
    if (!validation.valid) {
      toast.error(validation.error);
      
      // Scroll to invalid house if index provided
      if (validation.houseIndex !== undefined) {
        setTimeout(() => {
          const houseCard = document.getElementById(`house-card-${validation.houseIndex}`);
          if (houseCard) {
            houseCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Step 1: Validate all house postcodes and get coordinates
      toast.loading("Verifying house postcodes...");
      
      const validatedHouses = [];
      
      for (let i = 0; i < houses.length; i++) {
        const house = houses[i];
        
        const postcodeValidation = await fetch("/api/validate-postcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postcode: house.postcode }),
        });

        const postcodeData = await postcodeValidation.json();

        if (!postcodeValidation.ok || !postcodeData.valid) {
          toast.dismiss();
          toast.error(`Property ${i + 1}: ${postcodeData.error || "Postcode not found"}`, {
            duration: 5000,
          });
          
          setTimeout(() => {
            const postcodeField = document.getElementById(`house-postcode-${i}`);
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

        validatedHouses.push({
          label: house.label,
          line1: house.line1,
          city: house.city,
          postcode: postcodeData.coordinates.postcode,
          notes: house.notes,
          username: house.username, 
          password: house.password,
          lat: postcodeData.coordinates.lat,
          lng: postcodeData.coordinates.lng,
        });
      }

      toast.dismiss();
      toast.loading("Setting up houses...");

      const payload = { 
        managerEmail, 
        name, 
        area, 
        houses: validatedHouses,
      };

      const res = await fetch("/api/onboarding/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Submission failed");
      }

      toast.dismiss();
      toast.success("Houses onboarded successfully!");
      setTimeout(() => router.push("/dashboard/manager"), 1200);
      
    } catch (err) {
      toast.dismiss();
      console.error("Onboarding failed:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = validateHouses().valid;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Onboard Your Houses
      </h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Your Area:</span> {area || "Not specified"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
          
          {houses.map((house, i) => (
            <div
              key={i}
              id={`house-card-${i}`}
              className="border p-4 rounded-md bg-gray-50 space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">
                  Property {i + 1}
                </span>
                {houses.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeHouse(i)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <Input
                placeholder="House Label (e.g., Main House, Oak Villa) *"
                value={house.label}
                onChange={(e) => handleHouseChange(i, "label", e.target.value)}
                required
              />
              <Input
                placeholder="Address Line 1 (e.g., 123 Main Street) *"
                value={house.line1}
                onChange={(e) => handleHouseChange(i, "line1", e.target.value)}
                required
              />
              <Input
                placeholder="City or Town *"
                value={house.city}
                onChange={(e) => handleHouseChange(i, "city", e.target.value)}
                required
              />
              
              <PostcodeInput
                id={`house-postcode-${i}`}
                value={house.postcode}
                onChange={(value) => handleHouseChange(i, "postcode", value)}
                label="Postcode"
                placeholder="e.g., SK3 0AA"
                required
              />

              {/* House Staff Access Section */}
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="flex items-start gap-2 mb-3 bg-blue-50 p-3 rounded-md">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">House Staff Access</p>
                    <p>Create login credentials for house staff to view daily and weekly bookings on a tablet. Staff will have read-only access.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Username field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., oakhouse-main, bigblue2024"
                      value={house.username || ""}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        handleHouseChange(i, "username", value);
                      }}
                      required
                      minLength={6}
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      6-20 characters: lowercase letters, numbers, and hyphens only
                    </p>
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords[i] ? "text" : "password"}
                        placeholder="Min 8 chars with uppercase, lowercase, number & symbol"
                        value={house.password}
                        onChange={(e) => handleHouseChange(i, "password", e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(i)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords[i] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      At least 8 characters with uppercase, lowercase, number, and special character (!@#$%^&*)
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type={showPasswords[i] ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={house.confirmPassword}
                      onChange={(e) => handleHouseChange(i, "confirmPassword", e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
              
              <Textarea
                placeholder="Notes (optional - any additional information)"
                value={house.notes}
                onChange={(e) => handleHouseChange(i, "notes", e.target.value)}
                rows={2}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={addHouse}>
            + Add Another House
          </Button>
          <Button
            type="submit"
            disabled={submitting || !isValid}
            className="bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingManager;