// lib/bookingMatcher.js

import { prisma } from "@/lib/db";

/**
 * Enhanced booking matcher with hard filters and soft preferences
 * Customized for your exact Prisma schema
 * 
 * HARD FILTERS (Must match - driver is eliminated if fails):
 * - Vehicle type (if WAV required, driver must have WAV)
 * - Approval status (must be approved)
 * - Availability (time conflicts)
 * - Service area (geographic coverage using baseLat/baseLng and radiusMiles)
 * 
 * SOFT PREFERENCES (Scored - driver gets bonus points):
 * - Female driver preference (+20 points)
 * - Proximity to pickup (+30 points)
 * - Driver ratings (+20 points)
 * - Experience (+15 points)
 * - Previous rides with resident (+15 points)
 * 
 * MAX SCORE: 100 points
 */

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if time ranges overlap
function hasTimeConflict(booking1, booking2, bufferMinutes = 30) {
  const start1 = new Date(booking1.pickupTime);
  const end1 = new Date(start1.getTime() + 60 * 60000); // Assume 1 hour duration
  const start2 = new Date(booking2.pickupTime);
  const end2 = new Date(start2.getTime() + 60 * 60000);

  // Add buffer time
  const bufferedStart1 = new Date(start1.getTime() - bufferMinutes * 60000);
  const bufferedEnd1 = new Date(end1.getTime() + bufferMinutes * 60000);

  return bufferedStart1 <= end2 && bufferedEnd1 >= start2;
}

// ===== HARD FILTER 1: Vehicle Type =====
function meetsVehicleRequirement(driver, accessibilityProfile) {
  const vehicleType = accessibilityProfile.vehicleType || "either";
  const wheelchairAccess = accessibilityProfile.wheelchairAccess || false;

  // If wheelchair user, MUST have WAV
  if (wheelchairAccess && !driver.hasWAV) {
    return { pass: false, reason: "Wheelchair user requires WAV" };
  }

  // If WAV specifically required, driver must have it
  if (vehicleType === "wav" && !driver.hasWAV) {
    return { pass: false, reason: "WAV required but driver does not have WAV" };
  }

  // If standard only, driver must NOT be WAV-only
  if (vehicleType === "standard" && driver.wavOnly) {
    return { pass: false, reason: "Standard vehicle required but driver is WAV-only" };
  }

  // 'either' accepts any vehicle type
  return { pass: true, reason: "Vehicle type compatible" };
}

// ===== HARD FILTER 2: Approval Status =====
function isApproved(driver) {
  if (!driver.approved) {
    return { pass: false, reason: "Driver not approved" };
  }
  return { pass: true, reason: "Driver approved" };
}

// ===== HARD FILTER 3: Availability =====
async function isDriverAvailable(driverId, bookingTime) {
  try {
    const [advancedBookings, instantBookings] = await Promise.all([

       // Advanced bookings where this driver's bid was accepted
      prisma.advancedBooking.findMany({
        where: {
          acceptedBid: {
            driverId: driverId, // ✅ Check through the bid relation
          },
          status: {
            in: ["ACCEPTED", "SCHEDULED" ],
          },
        },
        select: {
          id: true,
          pickupTime: true,
        },
      }),
      
      // Instant bookings directly assigned to this driver
      prisma.instantBooking.findMany({
        where: {
          driverId: driverId, // ✅ Instant bookings DO have driverId
          status: {
            in: ["ACCEPTED", "IN_PROGRESS"],
          },
        },
        select: {
          id: true,
          pickupTime: true,
        },
      }),
    ]);
    //const allBookings = [...advancedBookings, ...instantBookings]
    //const newBooking = { pickupTime: bookingTime };

    // Check for conflicts
    // for (const existing of allBookings) {
    //   if (hasTimeConflict(newBooking, existing)) {
    //     return { 
    //       pass: false, 
    //       reason: `Time conflict with booking ${existing.id}` 
    //     };
    //   }
    // }

    return { pass: true, reason: "No time conflicts" };
  } catch (error) {
    console.error("Error checking driver availability:", error);
    return { pass: false, reason: "Error checking availability" };
  }
}

// ===== HARD FILTER 4: Service Area =====
// Uses driver.baseLat, driver.baseLng, and driver.radiusMiles
function isInServiceArea(driver, pickupLat, pickupLng) {
  if (!driver.baseLat || !driver.baseLng) {
    return { pass: true, reason: "No service area restriction" };
  }

  const distance = calculateDistance(
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

// ===== SOFT PREFERENCE 1: Female Driver =====
function getFemaleDriverScore(driver, accessibilityProfile) {
  const hasFemalePreference = accessibilityProfile.femaleDriverOnly || false;

  if (!hasFemalePreference) {
    return 0; // No preference, no bonus
  }

  if (driver.gender === "female") {
    return 20; // Bonus for matching preference
  }

  return 0; // No penalty, just no bonus
}

// ===== SOFT PREFERENCE 2: Proximity =====
function getProximityScore(distance) {
  if (distance === undefined || distance === null) return 0;
  
  // Closer is better: max 30 points
  if (distance < 5) return 30;
  if (distance < 10) return 25;
  if (distance < 15) return 15;
  if (distance < 20) return 10;
  if (distance < 25) return 5;
  return 0;
}

// ===== SOFT PREFERENCE 3: Rating =====
function getRatingScore(driver) {
  const rating = driver.rating || 0;
  // Max 20 points for 5-star rating
  return Math.round((rating / 5) * 20);
}

// ===== SOFT PREFERENCE 4: Experience =====
function getExperienceScore(driver) {
  const completedRides = driver.completedRides || 0;
  // Max 15 points for 100+ rides
  if (completedRides >= 100) return 15;
  if (completedRides >= 50) return 12;
  if (completedRides >= 20) return 9;
  if (completedRides >= 10) return 6;
  if (completedRides >= 5) return 3;
  return 0;
}

// ===== SOFT PREFERENCE 5: History with Resident =====
async function getResidentHistoryScore(driverId, residentId) {
  if (!residentId) return 0;

  try {
    // Count successful rides with this resident
    // Note: You'll need to adjust this based on how you link bookings to residents
    const successfulRides = await prisma.advancedBooking.count({
      where: {
        driverId: driverId,
        status: "COMPLETED",
        // Add resident linking here if available in your schema
      },
    });

    // Max 15 points for established relationship
    if (successfulRides >= 10) return 15;
    if (successfulRides >= 5) return 12;
    if (successfulRides >= 3) return 9;
    if (successfulRides >= 1) return 5;
    return 0;
  } catch (error) {
    console.error("Error getting resident history:", error);
    return 0;
  }
}

/**
 * Main matching function
 * Returns sorted array of drivers with match scores
 */
export async function findMatchingDrivers(bookingId) {
  try {
    // Get the booking with accessibility profile
    const booking = await prisma.advancedBooking.findUnique({
      where: { id: bookingId },
      include: {
        accessibilityProfile: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.accessibilityProfile) {
      throw new Error("Booking has no accessibility profile");
    }

    // Get all drivers
    // Note: You'll need to add businessId to Driver model if you want to filter by business
    const allDrivers = await prisma.driver.findMany({
      where: {
        approved: true, // Only approved drivers
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`Found ${allDrivers.length} approved drivers`);

    const pickupLat = booking.pickupLatitude;
    const pickupLng = booking.pickupLongitude;
    const pickupTime = booking.pickupTime;

    // PHASE 1: Apply HARD FILTERS
    const eligibleDrivers = [];

    for (const driver of allDrivers) {
      let passedFilters = true;
      const filterResults = {
        approved: { pass: true },
        vehicleType: { pass: true },
        availability: { pass: true },
        serviceArea: { pass: true },
      };
      let distance = null;

      // Filter 1: Approval (HARD)
      filterResults.approved = isApproved(driver);
      if (!filterResults.approved.pass) {
        passedFilters = false;
      }

      // Filter 2: Vehicle Type (HARD)
      if (passedFilters) {
        filterResults.vehicleType = meetsVehicleRequirement(
          driver,
          booking.accessibilityProfile
        );
        if (!filterResults.vehicleType.pass) {
          passedFilters = false;
        }
      }

      // Filter 3: Availability (HARD)
      if (passedFilters && pickupTime) {
        filterResults.availability = await isDriverAvailable(
          driver.id,
          pickupTime
        );
        if (!filterResults.availability.pass) {
          passedFilters = false;
        }
      }

      // Filter 4: Service Area (HARD)
      if (passedFilters && pickupLat && pickupLng) {
        filterResults.serviceArea = isInServiceArea(driver, pickupLat, pickupLng);
        if (!filterResults.serviceArea.pass) {
          passedFilters = false;
        } else {
          distance = filterResults.serviceArea.distance;
        }
      }

      if (passedFilters) {
        eligibleDrivers.push({
          ...driver,
          filterResults,
          distance,
        });
      } else {
        console.log(`Driver ${driver.name} filtered out:`, filterResults);
      }
    }

    console.log(`${eligibleDrivers.length} drivers passed hard filters`);

    // PHASE 2: Apply SOFT PREFERENCES and calculate scores
    const scoredDrivers = await Promise.all(
      eligibleDrivers.map(async (driver) => {
        const scores = {
          femaleDriver: getFemaleDriverScore(driver, booking.accessibilityProfile),
          proximity: getProximityScore(driver.distance),
          rating: getRatingScore(driver),
          experience: getExperienceScore(driver),
          residentHistory: await getResidentHistoryScore(driver.id, booking.residentId),
        };

        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        return {
          id: driver.id,
          name: driver.name,
          email: driver.user.email,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          vehicleReg: driver.vehicleReg,
          hasWAV: driver.hasWAV,
          hasStandard: driver.hasStandard,
          gender: driver.gender,
          rating: driver.rating,
          completedRides: driver.completedRides,
          distance: driver.distance,
          baseLat: driver.baseLat,
          baseLng: driver.baseLng,
          radiusMiles: driver.radiusMiles,
          matchScore: totalScore,
          scoreBreakdown: scores,
          maxPossibleScore: 100,
          filterResults: driver.filterResults,
        };
      })
    );

    // Sort by score (highest first)
    scoredDrivers.sort((a, b) => b.matchScore - a.matchScore);

    console.log(
      "Top 3 matched drivers:",
      scoredDrivers.slice(0, 3).map((d) => ({
        name: d.name,
        score: d.matchScore,
        breakdown: d.scoreBreakdown,
      }))
    );

    return scoredDrivers;
  } catch (error) {
    console.error("Error finding matching drivers:", error);
    throw error;
  }
}

/**
 * Get match explanation for a specific driver
 */
export function getMatchExplanation(driver) {
  const explanations = [];

  // Hard filters
  if (driver.filterResults) {
    if (driver.filterResults.approved?.pass) {
      explanations.push(`✅ ${driver.filterResults.approved.reason}`);
    } else if (driver.filterResults.approved) {
      explanations.push(`❌ ${driver.filterResults.approved.reason}`);
    }

    if (driver.filterResults.vehicleType.pass) {
      explanations.push(`✅ ${driver.filterResults.vehicleType.reason}`);
    } else {
      explanations.push(`❌ ${driver.filterResults.vehicleType.reason}`);
    }

    if (driver.filterResults.availability.pass) {
      explanations.push(`✅ ${driver.filterResults.availability.reason}`);
    } else {
      explanations.push(`❌ ${driver.filterResults.availability.reason}`);
    }

    if (driver.filterResults.serviceArea.pass) {
      explanations.push(`✅ ${driver.filterResults.serviceArea.reason}`);
    } else {
      explanations.push(`❌ ${driver.filterResults.serviceArea.reason}`);
    }
  }

  // Soft preferences
  if (driver.scoreBreakdown) {
    if (driver.scoreBreakdown.femaleDriver > 0) {
      explanations.push(
        `⭐ Female driver (preference matched) +${driver.scoreBreakdown.femaleDriver} pts`
      );
    }
    if (driver.scoreBreakdown.proximity > 0) {
      explanations.push(
        `⭐ Good proximity (${driver.distance?.toFixed(1)} miles) +${driver.scoreBreakdown.proximity} pts`
      );
    }
    if (driver.scoreBreakdown.rating > 0) {
      explanations.push(
        `⭐ ${driver.rating?.toFixed(1)} star rating +${driver.scoreBreakdown.rating} pts`
      );
    }
    if (driver.scoreBreakdown.experience > 0) {
      explanations.push(
        `⭐ Experienced (${driver.completedRides} rides) +${driver.scoreBreakdown.experience} pts`
      );
    }
    if (driver.scoreBreakdown.residentHistory > 0) {
      explanations.push(
        `⭐ Previous rides with resident +${driver.scoreBreakdown.residentHistory} pts`
      );
    }
  }

  return explanations;
}

export function matchDriverToBookings(driver, bookings) {
  const matches = [];

  for (const booking of bookings) {
    // Hard filters
    const vehicleCheck = meetsVehicleRequirement(driver, booking.accessibilityProfile);
    if (!vehicleCheck.pass) continue;

    const serviceAreaCheck = isInServiceArea(driver, booking.pickupLat, booking.pickupLng);
    if (!serviceAreaCheck.pass) continue;

    // Calculate score
    const scores = {
      femaleDriver: getFemaleDriverScore(driver, booking.accessibilityProfile),
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