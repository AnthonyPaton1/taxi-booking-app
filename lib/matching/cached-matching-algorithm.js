// lib/matching/cached-matching-algorithm.js
// Redis-cached wrapper around your existing matching algorithm

import { matchDriverToBookings } from './enhanced-matching-algorithm';
import { 
  getCachedDriverMatches, 
  cacheDriverMatches,
  invalidateDriverMatchCache 
} from './matchingCache';

/**
 * Match driver to bookings WITH REDIS CACHING
 * This is a drop-in replacement for matchDriverToBookings
 * 
 * @param {Object} driver - Driver object with profile
 * @param {Array} bookings - Array of booking objects
 * @param {Object} options - Optional config
 * @param {boolean} options.skipCache - Force fresh calculation
 * @returns {Array} - Sorted array of matched bookings with scores
 */
export async function matchDriverToBookingsCached(driver, bookings, options = {}) {
  const { skipCache = false } = options;

  

  // If cache is disabled or skipCache is true, run algorithm directly
  if (skipCache) {
    return matchDriverToBookings(driver, bookings);
  }

  // Try to get cached results
  const cached = await  getCachedDriverMatches(driver.id);
  
  if (cached) {
    console.log(`✅ Cache HIT: Returning cached matches for driver ${driver.id}`);
    return cached;
  }

 
console.log("🚗 Driver object:", { 
  id: driver.id, 
  vehicleClass: driver.vehicleClass,
  hasVehicleClass: 'vehicleClass' in driver 
});

  // Cache miss - run the matching algorithm
  const matches = matchDriverToBookings(driver, bookings);
  


  // Cache the results (fire and forget - don't wait)
  cacheDriverMatches(driver.id, matches).catch(err => {
    console.error('Failed to cache driver matches:', err);
  });

  return matches;
}

/**
 * Invalidate cache for a driver
 * Call this when driver updates their profile or availability
 */
export async function invalidateDriverCache(driverId) {
  await invalidateDriverMatchCache(driverId);
}

// Re-export original function for cases where caching isn't needed
export { matchDriverToBookings } from './enhanced-matching-algorithm';
