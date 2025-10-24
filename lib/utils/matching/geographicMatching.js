/**
 * Geographic Matching Module
 * Determines if drivers are within range of bookings based on postcodes
 */

import {
  getPostcodeCoordinates,
  calculateDistanceBetweenPostcodes,
  haversineDistance,
  getDriversInBoundingBox,
} from '../utils/postcodeUtils';

/**
 * Check if a driver's service area covers the booking pickup location
 * @param {string} driverBasePostcode - Driver's base postcode (e.g., "SK3 0AA")
 * @param {number} driverRadius - Max travel distance in miles
 * @param {string} bookingPickupPostcode - Pickup postcode
 * @returns {Promise<boolean>} True if driver can reach pickup
 */
export async function isWithinServiceArea(
  driverBasePostcode,
  driverRadius,
  bookingPickupPostcode
) {
  try {
    const distance = await calculateDistanceBetweenPostcodes(
      driverBasePostcode,
      bookingPickupPostcode
    );
    
    return distance <= driverRadius;
  } catch (error) {
    console.error('Service area check failed:', error);
    return false;
  }
}

/**
 * Check if driver can cover the entire journey (pickup to dropoff)
 * @param {Object} driver - Driver with basePostcode and travelRadius
 * @param {Object} booking - Booking with pickupPostcode and dropoffPostcode
 * @returns {Promise<boolean>}
 */
export async function canCoverJourney(driver, booking) {
  try {
    // Check if driver can reach pickup
    const canReachPickup = await isWithinServiceArea(
      driver.basePostcode,
      driver.travelRadius,
      booking.pickupPostcode
    );
    
    if (!canReachPickup) {
      return false;
    }
    
    // Check if dropoff is reasonable (optional - some drivers may charge more for long trips)
    // For now, we just check if they can reach the pickup
    return true;
  } catch (error) {
    console.error('Journey coverage check failed:', error);
    return false;
  }
}

/**
 * Get all eligible drivers for a booking based on geographic location
 * Uses two-phase filtering: bounding box (fast) then precise distance (accurate)
 * @param {Object} booking - Booking with pickupPostcode
 * @param {Array} drivers - Array of drivers with basePostcode, travelRadius, baseLat, baseLng
 * @returns {Promise<Array>} Array of eligible drivers
 */
export async function getGeographicallyEligibleDrivers(booking, drivers) {
  try {
    // Phase 1: Get pickup coordinates
    const pickupCoords = await getPostcodeCoordinates(booking.pickupPostcode);
    
    // Phase 2: Fast bounding box filter
    // Only check drivers who might possibly be in range
    const maxPossibleRadius = Math.max(...drivers.map(d => d.travelRadius));
    const nearbyDrivers = getDriversInBoundingBox(
      pickupCoords,
      drivers,
      maxPossibleRadius
    );
    
    console.log(
      `Bounding box filter: ${nearbyDrivers.length}/${drivers.length} drivers in range`
    );
    
    // Phase 3: Precise distance check with Haversine
    const eligibleDrivers = await Promise.all(
      nearbyDrivers.map(async (driver) => {
        const distance = haversineDistance(
          { lat: driver.baseLat, lng: driver.baseLng },
          pickupCoords
        );
        
        const isEligible = distance <= driver.travelRadius;
        
        return isEligible ? { ...driver, distanceToPickup: distance } : null;
      })
    );
    
    // Filter out null values and return
    return eligibleDrivers.filter(Boolean);
  } catch (error) {
    console.error('Geographic filtering failed:', error);
    return [];
  }
}

/**
 * Calculate proximity score for a driver (0-1, where 1 is closest)
 * Closer drivers get higher scores
 * @param {number} distance - Distance in miles
 * @param {number} maxRadius - Driver's maximum travel radius
 * @returns {number} Score between 0 and 1
 */
export function calculateProximityScore(distance, maxRadius) {
  if (distance > maxRadius) return 0;
  
  // Linear decay: driver at their base = 1.0, driver at max radius = 0.2
  const score = 1 - (distance / maxRadius) * 0.8;
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Get distance information between driver and booking
 * @param {Object} driver - Driver with basePostcode
 * @param {Object} booking - Booking with pickupPostcode and dropoffPostcode
 * @returns {Promise<Object>} Distance information
 */
export async function getDistanceInfo(driver, booking) {
  try {
    const driverCoords = await getPostcodeCoordinates(driver.basePostcode);
    const pickupCoords = await getPostcodeCoordinates(booking.pickupPostcode);
    const dropoffCoords = await getPostcodeCoordinates(booking.dropoffPostcode);
    
    const distanceToPickup = haversineDistance(driverCoords, pickupCoords);
    const journeyDistance = haversineDistance(pickupCoords, dropoffCoords);
    const totalDistance = distanceToPickup + journeyDistance;
    
    return {
      distanceToPickup: Math.round(distanceToPickup * 10) / 10, // Round to 1 decimal
      journeyDistance: Math.round(journeyDistance * 10) / 10,
      totalDistance: Math.round(totalDistance * 10) / 10,
      withinRange: distanceToPickup <= driver.travelRadius,
    };
  } catch (error) {
    console.error('Distance calculation failed:', error);
    return null;
  }
}