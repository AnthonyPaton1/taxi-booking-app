// lib/matching/distance-cache.js

import { haversineDistance } from './haversine';

/**
 * Simple in-memory cache for distance calculations
 * Reduces redundant distance calculations during matching
 */
class DistanceCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000; // Maximum cache entries
  }

  /**
   * Generate cache key from coordinates
   */
  generateKey(lat1, lon1, lat2, lon2) {
    // Round to 4 decimal places (~11m precision) for cache hits
    const roundedLat1 = Math.round(lat1 * 10000) / 10000;
    const roundedLon1 = Math.round(lon1 * 10000) / 10000;
    const roundedLat2 = Math.round(lat2 * 10000) / 10000;
    const roundedLon2 = Math.round(lon2 * 10000) / 10000;
    
    return `${roundedLat1},${roundedLon1}-${roundedLat2},${roundedLon2}`;
  }

  /**
   * Get distance from cache or calculate and store
   */
  getDistance(lat1, lon1, lat2, lon2) {
    const key = this.generateKey(lat1, lon1, lat2, lon2);
    
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Calculate distance
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    
    // Store in cache
    this.set(key, distance);
    
    return distance;
  }

  /**
   * Set cache entry with size management
   */
  set(key, value) {
    // If cache is full, remove oldest entry (FIFO)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Create singleton instance
const distanceCache = new DistanceCache();

/**
 * Calculate distance with caching
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
export function calculateDistanceWithCache(lat1, lon1, lat2, lon2) {
  return distanceCache.getDistance(lat1, lon1, lat2, lon2);
}

/**
 * Clear the distance cache
 */
export function clearDistanceCache() {
  distanceCache.clear();
}

/**
 * Get cache statistics
 */
export function getDistanceCacheStats() {
  return distanceCache.getStats();
}