"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Star, Clock } from "lucide-react";

/**
 * LocationAutocomplete Component
 * 
 * Props:
 * - value: Current input value
 * - onChange: Callback when input changes
 * - onLocationSelect: Callback when a saved location is selected
 * - placeholder: Input placeholder text
 * - label: Input label
 * - required: Whether field is required
 */
export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Enter address",
  label,
  required = false,
}) {
  const [savedLocations, setSavedLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch saved locations on mount
  useEffect(() => {
    fetchSavedLocations();
  }, []);

  const fetchSavedLocations = async () => {
    try {
      const res = await fetch("/api/saved-locations");
      const data = await res.json();

    
      
      if (res.ok) {
        setSavedLocations(data.savedLocations || []);
      }
    
    } catch (err) {
      console.error("Error fetching saved locations:", err);
    }
  };

  // Filter locations based on input
  useEffect(() => {
    if (!value || value.length < 2) {
      setFilteredLocations([]);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = savedLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(searchTerm) ||
        loc.address.toLowerCase().includes(searchTerm) ||
        loc.postcode.toLowerCase().includes(searchTerm)
    );

    setFilteredLocations(filtered);
  }, [value, savedLocations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
    setFocusedIndex(-1);
  };

  const handleLocationClick = async (location) => {
    // Update use count
    try {
      await fetch(`/api/saved-locations/${location.id}/use`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Error updating location use count:", err);
    }

    // Call the callback with full location data
    onLocationSelect(location);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredLocations.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredLocations.length) {
          handleLocationClick(filteredLocations[focusedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
          autoComplete="off"
        />
        <MapPin className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      {/* Dropdown with saved locations */}
      {showDropdown && filteredLocations.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Saved Locations
            </p>
          </div>
          
          {filteredLocations.map((location, index) => (
            <button
              key={location.id}
              type="button"
              onClick={() => handleLocationClick(location)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === focusedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {location.name}
                    </p>
                    {location.useCount > 5 && (
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {location.address}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {location.postcode}
                  </p>
                  {location.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic truncate">
                      {location.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      Used {location.useCount}x
                    </span>
                    {location.lastUsed && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(location.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Show message when typing but no matches */}
      {showDropdown && value.length >= 2 && filteredLocations.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
        >
          <p className="text-sm text-gray-500 text-center">
            No saved locations match "{value}"
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Continue typing to enter a new address
          </p>
        </div>
      )}
    </div>
  );
}