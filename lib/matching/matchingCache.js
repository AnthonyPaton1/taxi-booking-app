// lib/matching/matchingCache.js
// Redis caching layer for expensive matching algorithm results

import redis  from '@/lib/redis';

const CACHE_KEYS = {
  DRIVER_TO_BOOKINGS: 'match:driver-bookings:',
  BOOKINGS_TO_DRIVERS: 'match:booking-drivers:',
};

const CACHE_TTL = {
  MATCHING_RESULT: 60, // 10 minutes - balances freshness vs performance
};

/**
 * Cache driver-to-bookings matching results
 * @param {string} driverId - Driver ID
 * @param {Array} matches - Array of matched bookings with scores
 */
export async function cacheDriverMatches(driverId, matches) {
  const key = `${CACHE_KEYS.DRIVER_TO_BOOKINGS}${driverId}`;
  try {
    await redis.setex(key, CACHE_TTL.MATCHING_RESULT, JSON.stringify(matches));
    console.log(`✅ Cached driver matches: ${driverId} (${matches.length} bookings)`);
  } catch (error) {
    console.error('Redis cache error (driver matches):', error);
  }
}

/**
 * Get cached driver-to-bookings matching results
 * @param {string} driverId - Driver ID
 * @returns {Array|null} - Cached matches or null if not found
 */
export async function getCachedDriverMatches(driverId) {
  const key = `${CACHE_KEYS.DRIVER_TO_BOOKINGS}${driverId}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache HIT: Driver matches for ${driverId}`);
      return JSON.parse(cached);
    }
    console.log(`❌ Cache MISS: Driver matches for ${driverId}`);
    return null;
  } catch (error) {
    console.error('Redis get error (driver matches):', error);
    return null;
  }
}

/**
 * Cache booking-to-drivers matching results
 * @param {string} bookingId - Booking ID
 * @param {Array} matches - Array of matched drivers with scores
 */
export async function cacheBookingMatches(bookingId, matches) {
  const key = `${CACHE_KEYS.BOOKINGS_TO_DRIVERS}${bookingId}`;
  try {
    await redis.setex(key, CACHE_TTL.MATCHING_RESULT, JSON.stringify(matches));
    console.log(`✅ Cached booking matches: ${bookingId} (${matches.length} drivers)`);
  } catch (error) {
    console.error('Redis cache error (booking matches):', error);
  }
}

/**
 * Get cached booking-to-drivers matching results
 * @param {string} bookingId - Booking ID
 * @returns {Array|null} - Cached matches or null if not found
 */
export async function getCachedBookingMatches(bookingId) {
  const key = `${CACHE_KEYS.BOOKINGS_TO_DRIVERS}${bookingId}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache HIT: Booking matches for ${bookingId}`);
      return JSON.parse(cached);
    }
    console.log(`❌ Cache MISS: Booking matches for ${bookingId}`);
    return null;
  } catch (error) {
    console.error('Redis get error (booking matches):', error);
    return null;
  }
}

/**
 * Invalidate driver matching cache
 * Call this when:
 * - Driver updates availability
 * - Driver updates service area
 * - Driver updates vehicle type
 * - Driver completes/cancels a booking
 */
export async function invalidateDriverMatchCache(driverId) {
  const key = `${CACHE_KEYS.DRIVER_TO_BOOKINGS}${driverId}`;
  try {
    await redis.del(key);
    console.log(`🗑️ Invalidated driver match cache: ${driverId}`);
  } catch (error) {
    console.error('Redis delete error (driver cache):', error);
  }
}

/**
 * Invalidate booking matching cache
 * Call this when:
 * - Booking is updated
 * - Booking is cancelled
 * - Booking is completed
 * - Booking requirements change
 */
export async function invalidateBookingMatchCache(bookingId) {
  const key = `${CACHE_KEYS.BOOKINGS_TO_DRIVERS}${bookingId}`;
  try {
    await redis.del(key);
    console.log(`🗑️ Invalidated booking match cache: ${bookingId}`);
  } catch (error) {
    console.error('Redis delete error (booking cache):', error);
  }
}

/**
 * Invalidate ALL matching caches
 * Use sparingly - only for system-wide updates
 */
export async function invalidateAllMatchingCache() {
  try {
    const driverKeys = await redis.keys(`${CACHE_KEYS.DRIVER_TO_BOOKINGS}*`);
    const bookingKeys = await redis.keys(`${CACHE_KEYS.BOOKINGS_TO_DRIVERS}*`);
    const allKeys = [...driverKeys, ...bookingKeys];
    
    if (allKeys.length > 0) {
      await redis.del(...allKeys);
      console.log(`🗑️ Invalidated ALL matching caches (${allKeys.length} keys)`);
    }
  } catch (error) {
    console.error('Redis delete error (all caches):', error);
  }
}

/**
 * Get cache statistics
 */
export async function getMatchingCacheStats() {
  try {
    const driverKeys = await redis.keys(`${CACHE_KEYS.DRIVER_TO_BOOKINGS}*`);
    const bookingKeys = await redis.keys(`${CACHE_KEYS.BOOKINGS_TO_DRIVERS}*`);
    
    return {
      driverMatchCaches: driverKeys.length,
      bookingMatchCaches: bookingKeys.length,
      total: driverKeys.length + bookingKeys.length,
      ttl: CACHE_TTL.MATCHING_RESULT,
    };
  } catch (error) {
    console.error('Redis stats error:', error);
    return null;
  }
}