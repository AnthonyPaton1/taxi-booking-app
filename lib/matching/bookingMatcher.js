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
  return { pass: true, reason: "Driver approved" };
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
export function matchDriverToBookings(driver, bookings) {
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

// /**
//  * Export config and utilities for testing/admin
//  */
// export { MATCHING_CONFIG } from './matching-config';
// export { getDistanceCacheStats, clearDistanceCache } from './distance-cache';

// //Old and original algorithm prior to seperating and caching distances etc etc
// // lib/bookingMatcher.js

// import { prisma } from "@/lib/db";

// /**
//  * Enhanced booking matcher with hard filters and soft preferences
//  * Customized for your exact Prisma schema
//  * 
//  * HARD FILTERS (Must match - driver is eliminated if fails):
//  * - Vehicle type (if WAV required, driver must have WAV)
//  * - Approval status (must be approved)
//  * - Availability (time conflicts)
//  * - Service area (geographic coverage using baseLat/baseLng and radiusMiles)
//  * 
//  * SOFT PREFERENCES (Scored - driver gets bonus points):
//  * - Female driver preference (+20 points)
//  * - Proximity to pickup (+30 points)
//  * - Driver ratings (+20 points)
//  * - Experience (+15 points)
//  * - Previous rides with resident (+15 points)
//  * 
//  * MAX SCORE: 100 points
//  */

// // Calculate distance between two coordinates (Haversine formula)
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 3959; // Earth's radius in miles
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// // Check if time ranges overlap
// function hasTimeConflict(booking1, booking2, bufferMinutes = 15) {
//   const start1 = new Date(booking1.pickupTime);
//   const end1 = new Date(start1.getTime() + 15 * 60000); // Assume 15 minute duration
//   const start2 = new Date(booking2.pickupTime);
//   const end2 = new Date(start2.getTime() + 15 * 60000);

//   // Add buffer time
//   const bufferedStart1 = new Date(start1.getTime() - bufferMinutes * 60000);
//   const bufferedEnd1 = new Date(end1.getTime() + bufferMinutes * 60000);

//   return bufferedStart1 <= end2 && bufferedEnd1 >= start2;
// }

// // ===== HARD FILTER 1: Vehicle Type =====
// function meetsVehicleRequirement(driver, accessibilityProfile) {
//   const vehicleType = accessibilityProfile.vehicleType || "either";
//   const wheelchairAccess = accessibilityProfile.wheelchairAccess || false;

//   //  RULE 1: If wheelchair user, MUST have WAV
//   if (wheelchairAccess && !driver.hasWAV) {
//     return { pass: false, reason: "Wheelchair user requires WAV" };
//   }

//   //  RULE 2: If WAV explicitly required, driver must have it
//   if (vehicleType === "wav" && !driver.hasWAV) {
//     return { pass: false, reason: "WAV required but driver does not have WAV" };
//   }

//   //  RULE 3: If "standard" requested:
//   // - WAV can still bid (they can do standard jobs)
//   // - Standard-only can bid
//   // - WAV-ONLY drivers are excluded (they only do wheelchair jobs)
//   if (vehicleType === "standard" && driver.wavOnly) {
//     return { pass: false, reason: "Standard job, but driver is WAV-only" };
//   }

//   //  RULE 4: "either" accepts everyone
//   return { pass: true, reason: "Vehicle type compatible" };
// }

// // ===== HARD FILTER 2: Approval Status =====
// function isApproved(driver) {
//   if (!driver.approved) {
//     return { pass: false, reason: "Driver not approved" };
//   }
//   return { pass: true, reason: "Driver approved" };
// }

// // ===== HARD FILTER 3: Availability =====
// async function isDriverAvailable(driverId, bookingTime) {
//   try {
//     const [advancedBookings, instantBookings] = await Promise.all([

//        // Advanced bookings where this driver's bid was accepted
//       prisma.advancedBooking.findMany({
//         where: {
//           acceptedBid: {
//             driverId: driverId, //  Check through the bid relation
//           },
//           status: {
//             in: ["ACCEPTED", "SCHEDULED" ],
//           },
//         },
//         select: {
//           id: true,
//           pickupTime: true,
//         },
//       }),
      
//       // Instant bookings directly assigned to this driver
//       prisma.instantBooking.findMany({
//         where: {
//           driverId: driverId, //  Instant bookings DO have driverId
//           status: {
//             in: ["ACCEPTED", "IN_PROGRESS"],
//           },
//         },
//         select: {
//           id: true,
//           pickupTime: true,
//         },
//       }),
//     ]);
//     //const allBookings = [...advancedBookings, ...instantBookings]
//     //const newBooking = { pickupTime: bookingTime };

//     // Check for conflicts
//     // for (const existing of allBookings) {
//     //   if (hasTimeConflict(newBooking, existing)) {
//     //     return { 
//     //       pass: false, 
//     //       reason: `Time conflict with booking ${existing.id}` 
//     //     };
//     //   }
//     // }

//     return { pass: true, reason: "No time conflicts" };
//   } catch (error) {
//     console.error("Error checking driver availability:", error);
//     return { pass: false, reason: "Error checking availability" };
//   }
// }

// // ===== HARD FILTER 4: Service Area =====
// // Uses driver.baseLat, driver.baseLng, and driver.radiusMiles
// function isInServiceArea(driver, pickupLat, pickupLng) {
//   if (!driver.baseLat || !driver.baseLng) {
//     return { pass: true, reason: "No service area restriction" };
//   }

//   const distance = calculateDistance(
//     pickupLat,
//     pickupLng,
//     driver.baseLat,
//     driver.baseLng
//   );

//   const maxRadius = driver.radiusMiles || 25;

//   if (distance > maxRadius) {
//     return { 
//       pass: false, 
//       reason: `Outside service area (${distance.toFixed(1)} miles > ${maxRadius} miles)` 
//     };
//   }

//   return { 
//     pass: true, 
//     reason: `Within service area (${distance.toFixed(1)} miles)`,
//     distance 
//   };
// }

// // ===== SOFT PREFERENCE 1: Female Driver =====
// function meetsFemaleDriverRequirement(driver, accessibilityProfile) {
//   const requiresFemale = accessibilityProfile.femaleDriverOnly || false;
  
//   if (!requiresFemale) {
//     return { pass: true, reason: "No gender preference" };
//   }
  
//   // If female driver required, check the driver's profile flag
//   if (!driver.femaleDriverOnly) {
//     return { pass: false, reason: "Booking requires female driver" };
//   }
  
//   return { pass: true, reason: "Female driver requirement met" };
// }

// // ===== SOFT PREFERENCE 2: Proximity =====
// function getProximityScore(distance) {
//   if (distance === undefined || distance === null) return 0;
  
//   // Closer is better: max 30 points
  
//   if (distance < 15) return 30;
//   if (distance < 20) return 20;
//   if (distance < 25) return 15;
//   if (distance < 30) return 10;
//   return 0;
// }

// // ===== SOFT PREFERENCE 3: Rating =====
// function getRatingScore(driver) {
//   const rating = driver.rating || 0;
//   // Max 20 points for 5-star rating
//   return Math.round((rating / 5) * 20);
// }

// // ===== SOFT PREFERENCE 4: Experience =====
// function getExperienceScore(driver) {
//   const completedRides = driver.completedRides || 0;
//   // Max 15 points for 100+ rides
//   if (completedRides >= 100) return 15;
//   if (completedRides >= 50) return 12;
//   if (completedRides >= 20) return 9;
//   if (completedRides >= 10) return 6;
//   if (completedRides >= 5) return 3;
//   return 0;
// }

// // ===== SOFT PREFERENCE 5: History with Resident =====
// async function getResidentHistoryScore(driverId, residentId) {
//   if (!residentId) return 0;

//   try {
//     // Count successful rides with this resident
//     // Note: You'll need to adjust this based on how you link bookings to residents
//     const successfulRides = await prisma.advancedBooking.count({
//       where: {
//         driverId: driverId,
//         status: "COMPLETED",
//         // Add resident linking here if available in your schema
//       },
//     });

//     // Max 15 points for established relationship
//     if (successfulRides >= 10) return 15;
//     if (successfulRides >= 5) return 12;
//     if (successfulRides >= 3) return 9;
//     if (successfulRides >= 1) return 5;
//     return 0;
//   } catch (error) {
//     console.error("Error getting resident history:", error);
//     return 0;
//   }
// }

// /**
//  * Main matching function
//  * Returns sorted array of drivers with match scores
//  */
// export async function findMatchingDrivers(bookingId) {
//   try {
//     // Get the booking with accessibility profile
//     const booking = await prisma.advancedBooking.findUnique({
//       where: { id: bookingId },
//       include: {
//         accessibilityProfile: true,
//       },
//     });

//     if (!booking) {
//       throw new Error("Booking not found");
//     }

//     if (!booking.accessibilityProfile) {
//       throw new Error("Booking has no accessibility profile");
//     }

//     // Get all drivers
   
//     const allDrivers = await prisma.driver.findMany({
//       where: {
//         approved: true, // Only approved drivers
//       },
//       include: {
//         user: {
//           select: {
//             email: true,
//           },
//         },
//       },
//     });

//     console.log(`Found ${allDrivers.length} approved drivers`);

//     const pickupLat = booking.pickupLatitude;
//     const pickupLng = booking.pickupLongitude;
//     const pickupTime = booking.pickupTime;

//     // PHASE 1: Apply HARD FILTERS
//     const eligibleDrivers = [];

//     for (const driver of allDrivers) {
//       let passedFilters = true;
//       const filterResults = {
//         approved: { pass: true },
//         vehicleType: { pass: true },
//         femaleDriver: { pass: true },
//         availability: { pass: true },
//         serviceArea: { pass: true },
//       };
//       let distance = null;

//       // Filter 1: Approval (HARD)
//       filterResults.approved = isApproved(driver);
//       if (!filterResults.approved.pass) {
//         passedFilters = false;
//       }

//       // Filter 2: Vehicle Type (HARD)
//       if (passedFilters) {
//         filterResults.vehicleType = meetsVehicleRequirement(
//           driver,
//           booking.accessibilityProfile
//         );
//         if (!filterResults.vehicleType.pass) {
//           passedFilters = false;
//         }
//       }
// //filter 2.5: Female driver req
//        if (passedFilters) {
//     filterResults.femaleDriver = meetsFemaleDriverRequirement(
//       driver,
//       booking.accessibilityProfile
//     );
//     if (!filterResults.femaleDriver.pass) {
//       passedFilters = false;
//     }
//   }

//       // Filter 3: Availability (HARD)
//       if (passedFilters && pickupTime) {
//         filterResults.availability = await isDriverAvailable(
//           driver.id,
//           pickupTime
//         );
//         if (!filterResults.availability.pass) {
//           passedFilters = false;
//         }
//       }

//       // Filter 4: Service Area (HARD)
//       if (passedFilters && pickupLat && pickupLng) {
//         filterResults.serviceArea = isInServiceArea(driver, pickupLat, pickupLng);
//         if (!filterResults.serviceArea.pass) {
//           passedFilters = false;
//         } else {
//           distance = filterResults.serviceArea.distance;
//         }
//       }

//       if (passedFilters) {
//         eligibleDrivers.push({
//           ...driver,
//           filterResults,
//           distance,
//         });
//       } else {
//         console.log(`Driver ${driver.name} filtered out:`, filterResults);
//       }
//     }

//     console.log(`${eligibleDrivers.length} drivers passed hard filters`);

//     // PHASE 2: Apply SOFT PREFERENCES and calculate scores
//     const scoredDrivers = await Promise.all(
//       eligibleDrivers.map(async (driver) => {
//         const scores = {
//           femaleDriver: 0,
//           proximity: getProximityScore(driver.distance),
//           rating: getRatingScore(driver),
//           experience: getExperienceScore(driver),
//           residentHistory: await getResidentHistoryScore(driver.id, booking.residentId),
//         };

//         const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

//         return {
//           id: driver.id,
//           name: driver.name,
//           email: driver.user.email,
//           phone: driver.phone,
//           vehicleType: driver.vehicleType,
//           vehicleReg: driver.vehicleReg,
//           hasWAV: driver.hasWAV,
//           hasStandard: driver.hasStandard,
//           gender: driver.gender,
//           rating: driver.rating,
//           completedRides: driver.completedRides,
//           distance: driver.distance,
//           baseLat: driver.baseLat,
//           baseLng: driver.baseLng,
//           radiusMiles: driver.radiusMiles,
//           matchScore: totalScore,
//           scoreBreakdown: scores,
//           maxPossibleScore: 100,
//           filterResults: driver.filterResults,
//         };
//       })
//     );

//     // Sort by score (highest first)
//     scoredDrivers.sort((a, b) => b.matchScore - a.matchScore);

//     console.log(
//       "Top 10 matched drivers:",
//       scoredDrivers.slice(0, 10).map((d) => ({
//         name: d.name,
//         score: d.matchScore,
//         breakdown: d.scoreBreakdown,
//       }))
//     );

//     return scoredDrivers;
//   } catch (error) {
//     console.error("Error finding matching drivers:", error);
//     throw error;
//   }
// }

// /**
//  * Get match explanation for a specific driver
//  */
// export function getMatchExplanation(driver) {
//   const explanations = [];

//   // Hard filters
//   if (driver.filterResults) {
//     if (driver.filterResults.approved?.pass) {
//       explanations.push(`✅ ${driver.filterResults.approved.reason}`);
//     } else if (driver.filterResults.approved) {
//       explanations.push(`❌ ${driver.filterResults.approved.reason}`);
//     }

//     if (driver.filterResults.vehicleType.pass) {
//       explanations.push(`✅ ${driver.filterResults.vehicleType.reason}`);
//     } else {
//       explanations.push(`❌ ${driver.filterResults.vehicleType.reason}`);
//     }

//     if (driver.filterResults.availability.pass) {
//       explanations.push(`✅ ${driver.filterResults.availability.reason}`);
//     } else {
//       explanations.push(`❌ ${driver.filterResults.availability.reason}`);
//     }

//     if (driver.filterResults.serviceArea.pass) {
//       explanations.push(`✅ ${driver.filterResults.serviceArea.reason}`);
//     } else {
//       explanations.push(`❌ ${driver.filterResults.serviceArea.reason}`);
//     }
//   }

//   // Soft preferences
//   if (driver.scoreBreakdown) {
//     if (driver.scoreBreakdown.femaleDriver > 0) {
//       explanations.push(
//         `⭐ Female driver (preference matched) +${driver.scoreBreakdown.femaleDriver} pts`
//       );
//     }
//     if (driver.scoreBreakdown.proximity > 0) {
//       explanations.push(
//         `⭐ Good proximity (${driver.distance?.toFixed(1)} miles) +${driver.scoreBreakdown.proximity} pts`
//       );
//     }
//     if (driver.scoreBreakdown.rating > 0) {
//       explanations.push(
//         `⭐ ${driver.rating?.toFixed(1)} star rating +${driver.scoreBreakdown.rating} pts`
//       );
//     }
//     if (driver.scoreBreakdown.experience > 0) {
//       explanations.push(
//         `⭐ Experienced (${driver.completedRides} rides) +${driver.scoreBreakdown.experience} pts`
//       );
//     }
//     if (driver.scoreBreakdown.residentHistory > 0) {
//       explanations.push(
//         `⭐ Previous rides with resident +${driver.scoreBreakdown.residentHistory} pts`
//       );
//     }
//   }

//   return explanations;
// }

// export function oldMatchDriversToBooking(driver, booking) {
//    const bookings = [booking];
//   const matches = [];

//   for (const booking of bookings) {
//     // Hard filters
//     const vehicleCheck = meetsVehicleRequirement(driver, bookings.accessibilityProfile);
//     if (!vehicleCheck.pass) continue;

   
//     const femaleCheck = meetsFemaleDriverRequirement(driver, bookings.accessibilityProfile);
//     if (!femaleCheck.pass) continue;

//     const serviceAreaCheck = isInServiceArea(driver, booking.pickupLat, bookings.pickupLng);
//     if (!serviceAreaCheck.pass) continue;

//     // Calculate score (without femaleDriver)
//     const scores = {
//       proximity: getProximityScore(serviceAreaCheck.distance),
//       rating: getRatingScore(driver),
//       experience: getExperienceScore(driver),
//     };

//     const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    

//     matches.push({
//       bookings,
//       score: totalScore,
//       scoreBreakdown: scores,
//       distance: serviceAreaCheck.distance,
//     });
//   }
  
  

//   return matches.sort((a, b) => b.score - a.score);
// }
