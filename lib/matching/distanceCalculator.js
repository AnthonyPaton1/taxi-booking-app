/**
 * Distance Calculator using Haversine Formula
 * Calculates the distance between two points on Earth given their latitude and longitude
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  // Earth's radius in miles
  const EARTH_RADIUS_MILES = 3959;

  // Convert degrees to radians
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in miles
  const distance = EARTH_RADIUS_MILES * c;

  return distance;
}

/**
 * Check if a pickup location is within a driver's service radius
 * @param {number} driverLat - Driver's base latitude
 * @param {number} driverLng - Driver's base longitude
 * @param {number} driverRadius - Driver's service radius in miles
 * @param {number} pickupLat - Pickup location latitude
 * @param {number} pickupLng - Pickup location longitude
 * @returns {boolean} True if pickup is within driver's radius
 */
export function isWithinRadius(driverLat, driverLng, driverRadius, pickupLat, pickupLng) {
  const distance = calculateDistance(driverLat, driverLng, pickupLat, pickupLng);
  return distance <= driverRadius;
}

/**
 * Get distance in a human-readable format
 * @param {number} distance - Distance in miles
 * @returns {string} Formatted distance (e.g., "2.5 miles", "0.3 miles")
 */
export function formatDistance(distance) {
  return `${distance.toFixed(1)} mile${distance !== 1 ? 's' : ''}`;
}

/**
 * Calculate estimated drive time based on distance
 * Assumes average speed of 30 mph in urban areas
 * @param {number} distance - Distance in miles
 * @returns {number} Estimated time in minutes
 */
export function estimateDriveTime(distance) {
  const AVERAGE_SPEED_MPH = 30;
  const hours = distance / AVERAGE_SPEED_MPH;
  const minutes = Math.round(hours * 60);
  return minutes;
}

/**
 * Format drive time in human-readable format
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time (e.g., "15 mins", "1 hour 30 mins")
 */
export function formatDriveTime(minutes) {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMins} min${remainingMins !== 1 ? 's' : ''}`;
}

/**
 * Find all drivers within a certain radius of a pickup location
 * @param {Array} drivers - Array of driver objects with baseLat, baseLng, radiusMiles
 * @param {number} pickupLat - Pickup location latitude
 * @param {number} pickupLng - Pickup location longitude
 * @returns {Array} Array of {driver, distance} objects sorted by distance
 */
export function findDriversInRadius(drivers, pickupLat, pickupLng) {
  return drivers
    .map(driver => ({
      driver,
      distance: calculateDistance(driver.baseLat, driver.baseLng, pickupLat, pickupLng)
    }))
    .filter(({ driver, distance }) => distance <= driver.radiusMiles)
    .sort((a, b) => a.distance - b.distance); // Closest first
}

/**
 * Calculate total trip distance (pickup to dropoff)
 * @param {number} pickupLat - Pickup latitude
 * @param {number} pickupLng - Pickup longitude
 * @param {number} dropoffLat - Dropoff latitude
 * @param {number} dropoffLng - Dropoff longitude
 * @returns {number} Total distance in miles
 */
export function calculateTripDistance(pickupLat, pickupLng, dropoffLat, dropoffLng) {
  return calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
}

// Example usage and tests (commented out for production)
/*
// Test with real UK postcodes
const SK3_0AA = { lat: 53.4084, lng: -2.1487 }; // Stockport
const M1_1AA = { lat: 53.4808, lng: -2.2426 };  // Manchester city centre
const M60_1NW = { lat: 53.4831, lng: -2.2444 }; // Manchester

console.log('Distance tests:');
console.log('SK3 0AA → M1 1AA:', formatDistance(calculateDistance(SK3_0AA.lat, SK3_0AA.lng, M1_1AA.lat, M1_1AA.lng)));
// Expected: ~4.7 miles

console.log('M1 1AA → M60 1NW:', formatDistance(calculateDistance(M1_1AA.lat, M1_1AA.lng, M60_1NW.lat, M60_1NW.lng)));
// Expected: ~0.1 miles (very close)

// Test within radius
const driver = { baseLat: SK3_0AA.lat, baseLng: SK3_0AA.lng, radiusMiles: 5 };
console.log('\nRadius tests:');
console.log('M1 1AA within 5mi of SK3 0AA?', isWithinRadius(driver.baseLat, driver.baseLng, driver.radiusMiles, M1_1AA.lat, M1_1AA.lng));
// Expected: true (4.7 miles < 5 miles)

const farPickup = { lat: 51.5074, lng: -0.1278 }; // London
console.log('London within 5mi of SK3 0AA?', isWithinRadius(driver.baseLat, driver.baseLng, driver.radiusMiles, farPickup.lat, farPickup.lng));
// Expected: false (way too far)

// Test drive time
console.log('\nDrive time tests:');
console.log('4.7 miles:', formatDriveTime(estimateDriveTime(4.7)));
// Expected: 9 mins

console.log('15 miles:', formatDriveTime(estimateDriveTime(15)));
// Expected: 30 mins

console.log('45 miles:', formatDriveTime(estimateDriveTime(45)));
// Expected: 1 hour 30 mins
*/