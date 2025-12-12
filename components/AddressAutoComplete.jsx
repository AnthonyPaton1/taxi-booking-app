// components/AddressAutoComplete.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function AddressAutocomplete({
  value = "", // ✅ Default to empty string
  onChange,
  onPlaceSelected,
  placeholder = "Enter address, postcode, or building name",
  label = "Address",
  required = false,
  error = null,
  className = ""
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return;

    const initAutocomplete = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps?.places) {
          initializeAutocomplete();
          return;
        }

        // Check if script is already in the document
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Wait for it to load
          existingScript.addEventListener('load', () => {
            initializeAutocomplete();
          });
          return;
        }

        // Load the Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        
        // ✅ Use callback to ensure script is fully loaded
        window.initGoogleMaps = () => {
          scriptLoadedRef.current = true;
          initializeAutocomplete();
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setLoadError('Failed to load Google Maps. Please check your API key and refresh the page.');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setLoadError('Failed to initialize address autocomplete.');
        setIsLoading(false);
      }
    };

    const initializeAutocomplete = () => {
      try {
        // ✅ Double check Google Maps is available
        if (!window.google?.maps?.places) {
          console.error('Google Maps Places library not loaded');
          setLoadError('Google Maps failed to load properly.');
          setIsLoading(false);
          return;
        }

        setIsLoading(false);

        if (!inputRef.current) {
          console.warn('Input ref not available');
          return;
        }

        // Initialize autocomplete with UK bias
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'gb' }, // Restrict to UK
          fields: [
            'address_components',
            'formatted_address',
            'geometry',
            'name',
            'place_id'
          ],
          types: ['address', 'establishment'] // Allow addresses and places like hospitals
        });

        autocompleteRef.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          if (!place.geometry) {
            console.warn('No details available for input:', place.name);
            return;
          }

          // Extract address components
          const addressData = extractAddressData(place);

          // Update parent component
          if (onPlaceSelected) {
            onPlaceSelected(addressData);
          }

          // Update input value
          if (onChange) {
            onChange(place.formatted_address || place.name);
          }
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setLoadError('Failed to initialize address autocomplete.');
        setIsLoading(false);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // ✅ Empty dependency array - only run once

  // Extract useful data from Google Place object
  function extractAddressData(place) {
    const components = place.address_components || [];
    
    const getComponent = (type) => {
      const component = components.find(c => c.types.includes(type));
      return component?.long_name || '';
    };

    return {
      formattedAddress: place.formatted_address || place.name,
      name: place.name || '', // Building name (e.g., "Stepping Hill Hospital")
      streetNumber: getComponent('street_number'),
      street: getComponent('route'),
      city: getComponent('postal_town') || getComponent('locality'),
      county: getComponent('administrative_area_level_2'),
      postcode: getComponent('postal_code'),
      country: getComponent('country'),
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      placeId: place.place_id
    };
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value || ""} // ✅ Ensure always controlled
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={isLoading ? "Loading Google Maps..." : placeholder}
          disabled={isLoading || !!loadError}
          required={required}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error || loadError ? 'border-red-500' : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100 cursor-wait' : ''} ${loadError ? 'bg-red-50' : ''}`}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {loadError && (
        <p className="mt-1 text-sm text-red-600">{loadError}</p>
      )}

      {error && !loadError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {!loadError && (
        <p className="mt-1 text-xs text-gray-500">
          Start typing an address, postcode, or place name (e.g., "Stepping Hill Hospital")
        </p>
      )}
    </div>
  );
}