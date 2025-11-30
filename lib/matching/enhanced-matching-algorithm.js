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
 * UPDATED: Check vehicle class compatibility with booking requirements
 * This replaces the old meetsVehicleRequirement function
 */
function meetsVehicleRequirement(driver, booking) {
  const driverClass = driver.vehicleClass;
  const accessibilityProfile = booking.accessibilityProfile || {};
  const wheelchairConfig = booking.wheelchairConfig || accessibilityProfile.wheelchairConfig || {};
  
  // Extract requirements
    const wheelchairCount = 
    (accessibilityProfile.wheelchairUsersStaySeated || 0) + 
    (accessibilityProfile.wheelchairUsersCanTransfer || 0);
  const powerchairs = wheelchairConfig.powerchairs || 0;
  const manualChairs = wheelchairConfig.manualChairs || 0;
  const mobilityScooters = wheelchairConfig.mobilityScooters || 0;
  const requiresDoubleWAV = wheelchairCount >= 2;
  const requiresRearLoading =  false;
  const requiresSideLoading = false;
   const passengerCount = accessibilityProfile.ambulatoryPassengers || 1;

  // Define vehicle capabilities
  const vehicleCapabilities = {
    STANDARD_CAR: {
      maxPassengers: 4,
      wheelchairCapacity: 0,
      canAccommodateWheelchair: false,
      isWAV: false,
      loadingType: null,
    },
    LARGE_CAR: {
      maxPassengers: 7,
      wheelchairCapacity: 0,
      canAccommodateWheelchair: false,
      isWAV: false,
      loadingType: null,
      hasExtraBootSpace: true,
    },
    SIDE_LOADING_WAV: {
      maxPassengers: 6, // Including wheelchair user
      wheelchairCapacity: 1,
      canAccommodateWheelchair: true,
      isWAV: true,
      loadingType: 'side',
    },
    REAR_LOADING_WAV: {
      maxPassengers: 6, // Including wheelchair user
      wheelchairCapacity: 1,
      canAccommodateWheelchair: true,
      isWAV: true,
      loadingType: 'rear',
    },
    DOUBLE_WAV: {
      maxPassengers: 8, // Including 2 wheelchair users
      wheelchairCapacity: 3,
      canAccommodateWheelchair: true,
      isWAV: true,
      loadingType: 'rear', // Most double WAVs are rear-loading
      isDoubleWAV: true,
    },
    MINIBUS_ACCESSIBLE: {
      maxPassengers: 16,
      wheelchairCapacity: 4, // UPDATED: Can accommodate 3+ wheelchairs
      canAccommodateWheelchair: true,
      isWAV: true,
      loadingType: 'rear || side',
      isMinibus: true,
    },
    MINIBUS_STANDARD: {
      maxPassengers: 16,
      wheelchairCapacity: 0,
      canAccommodateWheelchair: false,
      isWAV: false,
      loadingType: null,
      isMinibus: true,
    },
  };

  const capability = vehicleCapabilities[driverClass];

  if (!capability) {
    return { 
      pass: false, 
      reason: `Unknown vehicle class: ${driverClass}` 
    };
  }

  // Check 1: Wheelchair requirement
  if (wheelchairCount > 0) {
    if (!capability.canAccommodateWheelchair) {
      return { 
        pass: false, 
        reason: `Booking requires ${wheelchairCount} wheelchair(s), vehicle has no wheelchair access` 
      };
    }

    if (wheelchairCount > capability.wheelchairCapacity) {
      return { 
        pass: false, 
        reason: `Booking requires ${wheelchairCount} wheelchair(s), vehicle capacity is ${capability.wheelchairCapacity}` 
      };
    }
  }

  // Check 2: Double WAV requirement
  if (requiresDoubleWAV && !capability.isDoubleWAV) {
    return { 
      pass: false, 
      reason: "Booking requires Double WAV capability" 
    };
  }

  // Check 3: Loading type preferences
  if (requiresRearLoading && capability.loadingType !== 'rear') {
    return { 
      pass: false, 
      reason: "Booking prefers rear-loading WAV" 
    };
  }

  if (requiresSideLoading && capability.loadingType !== 'side') {
    return { 
      pass: false, 
      reason: "Booking prefers side-loading WAV" 
    };
  }

  // Check 4: Total passenger capacity
  if (passengerCount > capability.maxPassengers) {
    return { 
      pass: false, 
      reason: `Booking has ${passengerCount} passengers, vehicle capacity is ${capability.maxPassengers}` 
    };
  }

  // Check 5: Mobility scooters (need extra boot space or WAV)
  if (mobilityScooters > 0 && !capability.hasExtraBootSpace && !capability.isWAV) {
    return { 
      pass: false, 
      reason: "Mobility scooter requires large vehicle or WAV" 
    };
  }

  return { 
    pass: true, 
    reason: `Vehicle class ${driverClass} meets all requirements`,
    vehicleClass: driverClass,
    capability 
  };
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
 * UPDATED: Calculate vehicle match bonus
 * Rewards vehicles that are a perfect fit vs overqualified
 */
function getVehicleMatchBonus(vehicleCheck, booking) {
  if (!vehicleCheck.pass) return 0;
  
  const wheelchairCount = booking.wheelchairConfig?.count || 0;
  const capability = vehicleCheck.capability;
  
  // Perfect match bonus (not overqualified)
  if (wheelchairCount === 0 && !capability.isWAV) {
    return 5; // Standard car for non-wheelchair booking
  }
  
  if (wheelchairCount === 1 && capability.wheelchairCapacity === 1) {
    return 5; // Single WAV for single wheelchair
  }
  
  if (wheelchairCount === 2 && capability.isDoubleWAV) {
    return 5; // Double WAV for 2 wheelchairs
  }
  
  // Loading type preference match
  if (booking.wheelchairConfig?.requiresRearLoading && capability.loadingType === 'rear') {
    return 3;
  }
  
  if (booking.wheelchairConfig?.requiresSideLoading && capability.loadingType === 'side') {
    return 3;
  }
  
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
export function matchDriverToBookings(driver, bookings) {
  const matches = [];

  for (const booking of bookings) {
    console.log(`\n📍 Checking booking ${booking.id.substring(0,8)}...`);
    
    // Hard filter: Approval
    const approvalCheck = isApproved(driver);
    console.log(`  ✓ Approval:`, approvalCheck);
    if (!approvalCheck.pass) continue;

    // Hard filter: Vehicle class compatibility (UPDATED)
    const vehicleCheck = meetsVehicleRequirement(driver, booking);
    console.log(`  ✓ Vehicle class:`, vehicleCheck);
    if (!vehicleCheck.pass) continue;

    // Hard filter: Female driver requirement
    const femaleCheck = meetsFemaleDriverRequirement(driver, booking.accessibilityProfile);
    console.log(`  ✓ Female:`, femaleCheck);
    if (!femaleCheck.pass) continue;

    // Hard filter: Service area
    const serviceAreaCheck = isInServiceArea(
      driver, 
      booking.pickupLatitude || booking.pickupLat, 
      booking.pickupLongitude || booking.pickupLng
    );
    console.log(`  ✓ Service area:`, serviceAreaCheck);
    if (!serviceAreaCheck.pass) continue;

    // Calculate soft preference scores
    const scores = {
      proximity: getProximityScore(serviceAreaCheck.distance),
      rating: getRatingScore(driver),
      experience: getExperienceScore(driver),
      vehicleMatch: getVehicleMatchBonus(vehicleCheck, booking), // NEW
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    matches.push({
      booking,
      score: totalScore,
      scoreBreakdown: scores,
      distance: serviceAreaCheck.distance,
      vehicleClass: driver.vehicleClass, // Include for debugging
    });
  }

  // Sort by score (highest first)
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * HELPER: Match MULTIPLE DRIVERS to a SINGLE BOOKING
 * (Used for finding eligible drivers for a booking)
 * 
 * @param {Array} drivers - Array of driver objects
 * @param {Object} booking - Booking object
 * @returns {Array} - Sorted array of matched drivers with scores
 */
export function matchBookingToDrivers(drivers, booking) {
  const matches = [];

  for (const driver of drivers) {
    // Hard filter: Approval
    const approvalCheck = isApproved(driver);
    if (!approvalCheck.pass) continue;

    // Hard filter: Vehicle class compatibility
    const vehicleCheck = meetsVehicleRequirement(driver, booking);
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
      vehicleMatch: getVehicleMatchBonus(vehicleCheck, booking),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    matches.push({
      driver,
      score: totalScore,
      scoreBreakdown: scores,
      distance: serviceAreaCheck.distance,
      vehicleClass: driver.vehicleClass,
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