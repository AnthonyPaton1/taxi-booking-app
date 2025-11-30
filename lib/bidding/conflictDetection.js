// lib/bidding/conflictDetection.js
import { prisma } from "@/lib/db";

/**
 * Check if a driver has conflicting bookings at similar times
 * @param {string} driverId 
 * @param {string} date - YYYY-MM-DD format
 * @param {string} time - HH:MM format
 * @param {number} windowMinutes - Check within ±X minutes (default 120 = 2 hours)
 * @returns {Promise<Array>} Array of conflicting bids/bookings
 */
export async function checkTimeConflicts(driverId, date, time, windowMinutes = 120) {
  try {
    const targetDateTime = new Date(`${date}T${time}`);
    const windowStart = new Date(targetDateTime.getTime() - windowMinutes * 60000);
    const windowEnd = new Date(targetDateTime.getTime() + windowMinutes * 60000);
    
    // Get start and end times as HH:MM strings
    const startTime = windowStart.toTimeString().slice(0, 5);
    const endTime = windowEnd.toTimeString().slice(0, 5);

    // Find pending or accepted bids in this time window
    const conflicts = await prisma.bid.findMany({
      where: {
        driverId,
        status: {
          in: ['PENDING', 'ACCEPTED', 'CONFIRMED']
        },
        booking: {
          pickupDate: date,
          pickupTime: {
            gte: startTime,
            lte: endTime
          }
        }
      },
      include: {
        booking: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            pickupDate: true,
            pickupTime: true,
            passengerCount: true,
            status: true
          }
        }
      },
      orderBy: {
        booking: {
          pickupTime: 'asc'
        }
      }
    });

    return conflicts;
  } catch (error) {
    console.error('Error checking time conflicts:', error);
    return [];
  }
}

/**
 * Calculate estimated trip duration in minutes
 * @param {object} booking 
 * @returns {number} Estimated minutes
 */
export function estimateTripDuration(booking) {
  // Base time
  let duration = 30; // Default 30 minutes
  
  // Add time for distance (rough estimate)
  // In production, you'd use Google Maps API or similar
  if (booking.pickupLat && booking.pickupLng && booking.dropoffLat && booking.dropoffLng) {
    const distance = calculateDistance(
      booking.pickupLat, 
      booking.pickupLng, 
      booking.dropoffLat, 
      booking.dropoffLng
    );
    // Assume 30mph average = 0.5 miles per minute
    duration = Math.ceil(distance / 0.5);
  }
  
  // Add buffer for wheelchair users
  if (booking.wheelchairUsers > 0) {
    duration += booking.wheelchairUsers * 10; // 10 min per wheelchair user
  }
  
  // Add buffer for multiple passengers
  if (booking.passengerCount > 4) {
    duration += 10;
  }
  
  return duration;
}

/**
 * Calculate distance between two coordinates in miles (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if driver has capacity for more bookings on a given day
 * @param {string} driverId 
 * @param {string} date 
 * @param {number} maxHours - Maximum work hours per day (default 10)
 * @returns {Promise<object>} { hasCapacity: boolean, hoursUsed: number, hoursRemaining: number }
 */
export async function checkDailyCapacity(driverId, date, maxHours = 10) {
  try {
    const confirmedBids = await prisma.bid.findMany({
      where: {
        driverId,
        status: {
          in: ['CONFIRMED', 'ACCEPTED']
        },
        booking: {
          pickupDate: date
        }
      },
      include: {
        booking: true
      }
    });

    let totalMinutes = 0;
    for (const bid of confirmedBids) {
      totalMinutes += estimateTripDuration(bid.booking);
    }

    const hoursUsed = totalMinutes / 60;
    const hoursRemaining = Math.max(0, maxHours - hoursUsed);

    return {
      hasCapacity: hoursRemaining > 0,
      hoursUsed: parseFloat(hoursUsed.toFixed(1)),
      hoursRemaining: parseFloat(hoursRemaining.toFixed(1)),
      maxHours
    };
  } catch (error) {
    console.error('Error checking daily capacity:', error);
    return { hasCapacity: true, hoursUsed: 0, hoursRemaining: maxHours, maxHours };
  }
}

/**
 * Format conflicts for display
 */
export function formatConflicts(conflicts) {
  if (conflicts.length === 0) return null;
  
  return conflicts.map(conflict => ({
    id: conflict.booking.id,
    time: conflict.booking.pickupTime,
    route: `${conflict.booking.pickupLocation} → ${conflict.booking.dropoffLocation}`,
    passengers: conflict.booking.passengerCount,
    status: conflict.booking.status,
    bidStatus: conflict.status
  }));
}