// lib/matching/enhanced-matching-algorithm.js

import { haversineDistance } from './haversine';
import { MATCHING_CONFIG } from './matching-config';
import { calculateDistanceWithCache } from './distance-cache';

/**
 * Calculate distance with caching enabled
 */
function getCachedDistance(lat1, lng1, lat2, lng2) {
  if (MATCHING_CONFIG?.performance?.enableDistanceCaching) {
    return calculateDistanceWithCache(lat1, lng1, lat2, lng2);
  }
  return haversineDistance(lat1, lng1, lat2, lng2);
}

/**
 * Get ride duration from booking or use default
 */
function getRideDuration(booking) {
  // Try to get duration from booking
  if (booking.estimatedDurationMinutes) {
    return booking.estimatedDurationMinutes / 60; // Convert to hours
  }
  
  // Try to calculate from pickup/dropoff times
  if (booking.pickupTime && booking.dropoffTime) {
    const pickupDate = new Date(booking.pickupTime);
    const dropoffDate = new Date(booking.dropoffTime);
    const durationMs = dropoffDate - pickupDate;
    return durationMs / (1000 * 60 * 60); // Convert to hours
  }
  
  // Fall back to 15 minutes
  return 0.25; // 15 minutes in hours
}

/**
 * Check if driver is approved
 */
function isApproved(driver) {
  if (!driver.approved) {
    return { pass: false, reason: "Driver not approved" };
  }
  
  // Check if suspended
  if (driver.suspended) {
    return { pass: false, reason: "Driver suspended" };
  }
  
  return { pass: true, reason: "Driver approved and active" };
}

/**
 * Check vehicle type requirement
 */
function meetsVehicleRequirement(driver, accessibilityProfile) {
  if (!accessibilityProfile) return { pass: true };
  
  const wheelchairAccess = accessibilityProfile.wheelchairAccess || false;
  const vehicleType = accessibilityProfile.vehicleType || "either";

  // If wheelchair user, MUST have WAV
  if (wheelchairAccess && !driver.hasWAV) {
    return { pass: false, reason: "Wheelchair user requires WAV" };
  }

  // If WAV explicitly required
  if (vehicleType === "wav" && !driver.hasWAV) {
    return { pass: false, reason: "WAV required" };
  }

  // If standard requested but driver is WAV-only
  if (vehicleType === "standard" && driver.wavOnly) {
    return { pass: false, reason: "Standard job, driver is WAV-only" };
  }

  return { pass: true, reason: "Vehicle type compatible" };
}

/**
 * Check female driver requirement
 */
function meetsFemaleDriverRequirement(driver, accessibilityProfile) {
  if (!accessibilityProfile) return { pass: true };
  
  const requiresFemale = accessibilityProfile.femaleDriverOnly || false;
  
  if (!requiresFemale) {
    return { pass: true, reason: "No gender preference" };
  }
  
  if (!driver.femaleDriverOnly) {
    return { pass: false, reason: "Booking requires female driver" };
  }
  
  return { pass: true, reason: "Female driver requirement met" };
}

/**
 * Check if booking is in driver's service area
 */
function isInServiceArea(driver, pickupLat, pickupLng) {
  if (!driver.baseLat || !driver.baseLng) {
    return { pass: true, reason: "No service area restriction" };
  }

  const distance = haversineDistance(
    pickupLat,
    pickupLng,
    driver.baseLat,
    driver.baseLng
  );

  const maxRadius = driver.radiusMiles || 25;

  if (distance > maxRadius) {
    return { 
      pass: false, 
      reason: `Outside service area (${distance.toFixed(1)} miles > ${maxRadius} miles)` 
    };
  }

  return { 
    pass: true, 
    reason: `Within service area (${distance.toFixed(1)} miles)`,
    distance 
  };
}

/**
 * Calculate proximity score
 */
function getProximityScore(distance) {
  if (distance === undefined || distance === null) return 0;
  
  if (distance < 5) return 30;
  if (distance < 10) return 25;
  if (distance < 15) return 20;
  if (distance < 20) return 15;
  if (distance < 25) return 10;
  return 0;
}

/**
 * Calculate rating score
 */
function getRatingScore(driver) {
  const rating = driver.rating || 0;
  return Math.round((rating / 5) * 20);
}

/**
 * Calculate experience score
 */
function getExperienceScore(driver) {
  const completedRides = driver.completedRides || 0;
  if (completedRides >= 100) return 15;
  if (completedRides >= 50) return 12;
  if (completedRides >= 20) return 9;
  if (completedRides >= 10) return 6;
  if (completedRides >= 5) return 3;
  return 0;
}

/**
 * Match a SINGLE DRIVER to MULTIPLE BOOKINGS
 * (Used for driver dashboard - shows which bookings match this driver)
 * 
 * @param {Object} driver - Driver object with profile
 * @param {Array} bookings - Array of booking objects
 * @returns {Array} - Sorted array of matched bookings with scores
 */
export async function matchDriverToBookings(driver, bookings) {
  const matches = [];

  for (const booking of bookings) {
    // Hard filter: Approval
    const approvalCheck = isApproved(driver);
    if (!approvalCheck.pass) continue;

    // Hard filter: Vehicle type
    const vehicleCheck = meetsVehicleRequirement(driver, booking.accessibilityProfile);
    if (!vehicleCheck.pass) continue;

    // Hard filter: Female driver requirement
    const femaleCheck = meetsFemaleDriverRequirement(driver, booking.accessibilityProfile);
    if (!femaleCheck.pass) continue;

    // Hard filter: Service area
    const serviceAreaCheck = isInServiceArea(
      driver, 
      booking.pickupLatitude || booking.pickupLat, 
      booking.pickupLongitude || booking.pickupLng
    );
    if (!serviceAreaCheck.pass) continue;

    // Calculate soft preference scores
    const scores = {
      proximity: getProximityScore(serviceAreaCheck.distance),
      rating: getRatingScore(driver),
      experience: getExperienceScore(driver),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    matches.push({
      booking,
      score: totalScore,
      scoreBreakdown: scores,
      distance: serviceAreaCheck.distance,
    });
  }

  // Sort by score (highest first)
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Export for backwards compatibility
 */
export { haversineDistance } from './haversine';
export { MATCHING_CONFIG } from './matching-config';