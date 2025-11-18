/**
 * Postcode Utilities
 * Uses Postcodes.io API (free, UK-only) to convert postcodes to coordinates
 */

/**
 * Get latitude and longitude for a UK postcode
 * @param {string} postcode - UK postcode (e.g., "SK3 0AA" or "M1 1AA")
 * @returns {Promise<{lat: number, lng: number, postcode: string}>}
 * @throws {Error} If postcode is invalid or API fails
 */
export async function getPostcodeCoordinates(postcode) {
  try {
    // Normalize the postcode first
    const { valid, normalized, error } = validateAndNormalizePostcode(postcode);
    
    if (!valid) {
      throw new Error(error || 'Invalid postcode format');
    }
    
    // Remove spaces for API call
    const cleanPostcode = normalized.replace(/\s/g, '');
    
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${cleanPostcode}`,
      {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    // Check content type before parsing
const contentType = response.headers.get("content-type");
if (!contentType || !contentType.includes("application/json")) {
  console.error("API returned non-JSON:", await response.text());
  throw new Error(`Invalid postcode format: ${postcode}`);
}
    
    const data = await response.json();
    
    // Postcodes.io returns 200 for valid, 404 for not found
    if (data.status === 200 && data.result) {
      return {
        lat: data.result.latitude,
        lng: data.result.longitude,
        postcode: normalized, // Return normalized version
      };
    }
    
    // Handle 404 - postcode doesn't exist
    if (data.status === 404) {
      throw new Error(`Postcode not found: ${normalized}. Please check and try again.`);
    }
    
    throw new Error(`Unable to verify postcode: ${normalized}`);
  } catch (error) {
    // Better error messages for users
    if (error.name === 'AbortError') {
      throw new Error('Postcode lookup timed out. Please try again.');
    }
    
    console.error('Postcode lookup failed:', error);
    throw error;
  }
}

/**
 * Validate UK postcode format
 * UK postcode patterns:
 * - A9 9AA (e.g., M1 1AA)
 * - A99 9AA (e.g., M60 1NW)
 * - AA9 9AA (e.g., SK3 0AA)
 * - AA99 9AA (e.g., CR2 6XH)
 * - A9A 9AA (e.g., W1A 0AX - London special areas only)
 * - AA9A 9AA (e.g., EC1A 1BB - London special areas only)
 * 
 * First part is always: 1-2 LETTERS + 1-2 NUMBERS + optional LETTER (London special areas only)
 * Second part is always: 1 NUMBER + 2 LETTERS
 * 
 * @param {string} postcode
 * @returns {boolean}
 */
export function isValidUKPostcode(postcode) {
  const cleaned = postcode.trim();
  
  // Split into two parts
  const parts = cleaned.split(/\s+/);
  if (parts.length !== 2) {
    return false;
  }
  
  const firstPart = parts[0].toUpperCase();
  const secondPart = parts[1].toUpperCase();
  
  // Second part must be: 1 digit + 2 letters (e.g., 1AA, 2BB)
  if (!/^[0-9][A-Z]{2}$/.test(secondPart)) {
    return false;
  }
  
  // First part validation
  // Extract components: letters, numbers, optional letter
  const match = firstPart.match(/^([A-Z]{1,2})([0-9]{1,2})([A-Z]?)$/);
  
  if (!match) {
    return false;
  }
  
  const [, letters, numbers, optionalLetter] = match;
  
  // Letter prefix must be 1-2 letters only (not 3)
  if (letters.length > 2) {
    return false;
  }
  
  // If there's an optional letter (A9A format), it must be a valid London area
  if (optionalLetter) {
    // Only certain London areas use the A9A or AA9A format
    const validLondonAreas = [
      'W', 'WC', 'E', 'EC', 'N', 'NW', 'SE', 'SW', 
      'CR', 'BR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 
      'SM', 'TW', 'UB', 'WD'
    ];
    
    if (!validLondonAreas.includes(letters)) {
      return false;
    }
  }
  
  // Reject patterns with multiple X's (common fake postcode pattern)
  const xCount = (cleaned.toUpperCase().match(/X/g) || []).length;
  if (xCount >= 3) {
    return false;
  }
  
  return true;
}

/**
 * Normalize postcode format (handles common user errors)
 * Converts to uppercase, fixes spacing, replaces common mistakes
 * @param {string} postcode
 * @returns {string} Normalized postcode
 */
export function normalizePostcode(postcode) {
  let normalized = postcode.trim().toUpperCase();
  
  // Remove all spaces first
  normalized = normalized.replace(/\s+/g, '');
  
  // Reject if no characters left
  if (normalized.length === 0) {
    return '';
  }
  
  // Add space before last 3 characters (standard UK format)
  // But only if there are at least 5 characters
  if (normalized.length >= 5 && normalized.length <= 7) {
    normalized = normalized.slice(0, -3) + ' ' + normalized.slice(-3);
  } else if (normalized.length < 5) {
    // Too short to be valid, return as-is
    return normalized;
  }
  
  return normalized;
}

/**
 * Validate and normalize postcode in one step
 * @param {string} postcode
 * @returns {{valid: boolean, normalized: string, error?: string}}
 */
export function validateAndNormalizePostcode(postcode) {
  if (!postcode || postcode.trim().length === 0) {
    return {
      valid: false,
      normalized: '',
      error: 'Postcode is required',
    };
  }
  
  const trimmed = postcode.trim();
  
  // Check for obviously invalid inputs
  if (trimmed.length < 5 || trimmed.length > 8) {
    return {
      valid: false,
      normalized: trimmed,
      error: 'UK postcodes must be 5-7 characters',
    };
  }
  
  // Check for patterns that are clearly not postcodes
  if (/^[A-Z]+$/i.test(trimmed.replace(/\s/g, ''))) {
    return {
      valid: false,
      normalized: trimmed,
      error: 'Invalid UK postcode format',
    };
  }
  
  // Step 1: Normalize format
  const normalized = normalizePostcode(trimmed);
  
  // Step 2: Check format with regex
  if (!isValidUKPostcode(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Invalid UK postcode format',
    };
  }
  
  return {
    valid: true,
    normalized,
  };
}

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 * @param {{lat: number, lng: number}} coords1 
 * @param {{lat: number, lng: number}} coords2 
 * @returns {number} Distance in miles
 */
export function haversineDistance(coords1, coords2) {
  const R = 3958.8; // Earth's radius in miles
  
  const dLat = toRadians(coords2.lat - coords1.lat);
  const dLon = toRadians(coords2.lng - coords1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.lat)) *
      Math.cos(toRadians(coords2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number}
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two postcodes
 * @param {string} postcode1 
 * @param {string} postcode2 
 * @returns {Promise<number>} Distance in miles
 */
export async function calculateDistanceBetweenPostcodes(postcode1, postcode2) {
  const coords1 = await getPostcodeCoordinates(postcode1);
  const coords2 = await getPostcodeCoordinates(postcode2);
  
  return haversineDistance(coords1, coords2);
}

/**
 * Get drivers within a bounding box (fast pre-filter)
 * This quickly eliminates drivers that are clearly out of range
 * @param {{lat: number, lng: number}} pickupCoords 
 * @param {Array} drivers - Array of drivers with baseLat and baseLng
 * @param {number} maxRadius - Maximum radius in miles
 * @returns {Array} Filtered drivers
 */
export function getDriversInBoundingBox(pickupCoords, drivers, maxRadius) {
  // ~1 degree latitude ≈ 69 miles
  // ~1 degree longitude ≈ 54.6 miles at UK latitude (53°)
  const maxLatDegrees = maxRadius / 69;
  const maxLngDegrees = maxRadius / 54.6;
  
  return drivers.filter(driver => {
    // Quick check: is driver within a square box?
    const latDiff = Math.abs(driver.baseLat - pickupCoords.lat);
    const lngDiff = Math.abs(driver.baseLng - pickupCoords.lng);
    
    return latDiff <= maxLatDegrees && lngDiff <= maxLngDegrees;
  });
}