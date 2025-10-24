"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * Postcode Input Component with built-in validation
 * Handles format checking and real-time feedback
 */
export function PostcodeInput({ 
  value, 
  onChange, 
  onValidated,
  label = "Postcode",
  placeholder = "e.g., SK3 0AA",
  required = false,
  disabled = false,
  className = "",
  id = "postcode", // Add id prop with default
}) {
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const validateFormat = (input) => {
    if (!input || input.trim().length === 0) {
      if (required) {
        setError("Postcode is required");
        return false;
      }
      setError("");
      return true;
    }

    // Check length first
    if (input.trim().length < 5 || input.trim().length > 8) {
      const errorMsg = "UK postcodes must be 5-7 characters";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 3000 });
      return false;
    }

    // Normalize: uppercase, fix spacing
    let normalized = input.trim().toUpperCase();
    normalized = normalized.replace(/\s+/g, "");
    
    // Add space before last 3 characters
    if (normalized.length >= 5) {
      normalized = normalized.slice(0, -3) + " " + normalized.slice(-3);
    }

    // Split into two parts
    const parts = normalized.split(/\s+/);
    if (parts.length !== 2) {
      const errorMsg = "Invalid UK postcode format";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 3000 });
      return false;
    }

    const firstPart = parts[0];
    const secondPart = parts[1];

    // Second part must be: 1 digit + 2 letters (e.g., 1AA, 2BB)
    if (!/^[0-9][A-Z]{2}$/.test(secondPart)) {
      const errorMsg = "Invalid UK postcode format";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 3000 });
      return false;
    }

    // First part validation: must match letters + numbers + optional letter
    const match = firstPart.match(/^([A-Z]{1,2})([0-9]{1,2})([A-Z]?)$/);
    
    if (!match) {
      const errorMsg = "Invalid UK postcode format";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 3000 });
      return false;
    }

    const [, letters, numbers, optionalLetter] = match;

    // Letter prefix must be 1-2 letters only (not 3)
    if (letters.length > 2) {
      const errorMsg = "Invalid UK postcode format";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 3000 });
      return false;
    }

    // If there's an optional letter (A9A format), it must be a valid London area
    if (optionalLetter) {
      const validLondonAreas = [
        'W', 'WC', 'E', 'EC', 'N', 'NW', 'SE', 'SW', 
        'CR', 'BR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 
        'SM', 'TW', 'UB', 'WD'
      ];
      
      if (!validLondonAreas.includes(letters)) {
        const errorMsg = "Invalid UK postcode format";
        setError(errorMsg);
        toast.error(errorMsg, { duration: 3000 });
        return false;
      }
    }

    // Reject patterns with multiple X's (common fake postcode pattern)
    const xCount = (normalized.match(/X/g) || []).length;
    if (xCount >= 3) {
      const errorMsg = "Invalid UK postcode format";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 3000 });
      return false;
    }

    setError("");
    
  
    onChange(normalized);
    
    // Notify parent that format is valid
    if (onValidated) {
      onValidated(normalized);
    }
    
    return true;
  };

  const handleBlur = () => {
    validateFormat(value);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    onChange(input);
    
    // Clear error as user types
    if (error) {
      setError("");
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
        maxLength={8} // UK postcodes max 7 chars + 1 space
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      {isChecking && (
        <p className="text-sm text-gray-500 mt-1">Verifying postcode...</p>
      )}
    </div>
    
  );
}

/**
 * Hook for postcode validation with API verification
 * Use this when you need to verify postcode exists (e.g., on form submit)
 */
export function usePostcodeValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const validatePostcode = async (postcode) => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/validate-postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid postcode");
        return { valid: false, error: data.error };
      }

      return { valid: true, coordinates: data.coordinates };
    } catch (err) {
      const errorMsg = "Failed to validate postcode. Please try again.";
      setError(errorMsg);
      return { valid: false, error: errorMsg };
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validatePostcode,
    isValidating,
    error,
  };
}