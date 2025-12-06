// app/actions/bookings/createPublicBooking.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { matchDriverToBookingsCached } from '@/lib/matching/cached-matching-algorithm';
import { sanitizeBookingData } from "@/lib/validation";

export async function createPublicBooking(formData) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // ===== INPUT SANITIZATION & VALIDATION =====
    let sanitizedData;
    try {
      sanitizedData = sanitizeBookingData(formData);
    } catch (validationError) {
      return { success: false, error: validationError.message };
    }

    // 2. Validate required fields
    if (!sanitizedData.pickupLocation || !sanitizedData.dropoffLocation) {
      return { success: false, error: "Missing pickup or dropoff location" };
    }

    // 3. Validate coordinates are present
    if (!sanitizedData.pickupLat || !sanitizedData.pickupLng) {
      return { success: false, error: "Pickup location must have valid coordinates" };
    }

    if (!sanitizedData.dropoffLat || !sanitizedData.dropoffLng) {
      return { success: false, error: "Dropoff location must have valid coordinates" };
    }

    // 4. Normalize times
    const pickupTime = new Date(sanitizedData.pickupTime);
    if (isNaN(pickupTime.getTime())) {
      return { success: false, error: "Invalid pickup time" };
    }

    const returnTime = sanitizedData.returnTime
      ? new Date(sanitizedData.returnTime)
      : null;

    // 5. Vehicle type mapping (same logic as manager)
    const vehicleTypeMap = {
      'wav': 'SIDE_LOADING_WAV',
      'car': 'STANDARD_CAR',
      'either': 'STANDARD_CAR',
      'standard': 'STANDARD_CAR',
      'large': 'LARGE_CAR',
      'STANDARD_CAR': 'STANDARD_CAR',
      'LARGE_CAR': 'LARGE_CAR',
      'SIDE_LOADING_WAV': 'SIDE_LOADING_WAV',
      'REAR_LOADING_WAV': 'REAR_LOADING_WAV',
      'DOUBLE_WAV': 'DOUBLE_WAV',
      'MINIBUS_STANDARD': 'MINIBUS_STANDARD',
      'MINIBUS_ACCESSIBLE': 'MINIBUS_ACCESSIBLE',
    };

    const vehicleType = sanitizedData.vehicleType || 'either';
    let finalVehicleType = vehicleTypeMap[vehicleType] || 'STANDARD_CAR';

    // Smart logic: if wheelchairs but they said "car", upgrade to WAV
    if (sanitizedData.wheelchairUsers > 0 && finalVehicleType === 'STANDARD_CAR') {
      if (sanitizedData.wheelchairConfig?.requiresDoubleWAV || sanitizedData.wheelchairUsers >= 2) {
        finalVehicleType = 'DOUBLE_WAV';
      } else if (sanitizedData.wheelchairConfig?.requiresRearLoading) {
        finalVehicleType = 'REAR_LOADING_WAV';
      } else {
        finalVehicleType = 'SIDE_LOADING_WAV';
      }
    }

    // 6. Create booking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create AccessibilityProfile
      const accessibilityProfile = await tx.accessibilityProfile.create({
        data: {
          vehicleClassRequired: finalVehicleType,
          
          // Passenger details
          ambulatoryPassengers: parseInt(sanitizedData.passengerCount) || 1,
          wheelchairUsersStaySeated: parseInt(sanitizedData.wheelchairUsers) || 0,
          wheelchairUsersCanTransfer: 0,
          carerPresent: sanitizedData.carerPresent || false,
          escortRequired: sanitizedData.escortRequired || false,
          
          // Mobility
          highRoof: sanitizedData.highRoof || false,
          seatTransferHelp: sanitizedData.seatTransferHelp || false,
          mobilityAidStorage: sanitizedData.mobilityAidStorage || false,
          electricScooterStorage: sanitizedData.electricScooterStorage || false,

          // Sensory
          quietEnvironment: sanitizedData.quietEnvironment || false,
          noConversation: sanitizedData.noConversation || false,
          noScents: sanitizedData.noScents || false,
          visualSchedule: sanitizedData.visualSchedule || false,
          specificMusic: sanitizedData.specificMusic || null,
          
          // Communication
          signLanguageRequired: sanitizedData.signLanguageRequired || false,
          textOnlyCommunication: sanitizedData.textOnlyCommunication || false,
          preferredLanguage: sanitizedData.preferredLanguage || null,
          translationSupport: sanitizedData.translationSupport || false,
          
          // Special requirements
          assistanceRequired: sanitizedData.assistanceRequired || false,
          assistanceAnimal: sanitizedData.assistanceAnimal || false,
          familiarDriverOnly: sanitizedData.familiarDriverOnly || false,
          femaleDriverOnly: sanitizedData.femaleDriverOnly || false,
          nonWAVvehicle: sanitizedData.nonWAVvehicle || false,
          
          // Health
          medicationOnBoard: sanitizedData.medicationOnBoard || false,
          medicalConditions: sanitizedData.medicalConditions || null,
          firstAidTrained: sanitizedData.firstAidTrained || false,
          conditionAwareness: sanitizedData.conditionAwareness || false,
          
          // Additional
          additionalNeeds: sanitizedData.additionalNeeds || null,
        },
      });

      // Step 2: Create Booking
      const booking = await tx.booking.create({
        data: {
          status: "PENDING",
          
          // Locations with coordinates
          pickupLocation: sanitizedData.pickupLocation,
          pickupLatitude: sanitizedData.pickupLat,
          pickupLongitude: sanitizedData.pickupLng,
          
          dropoffLocation: sanitizedData.dropoffLocation,
          dropoffLatitude: sanitizedData.dropoffLat,
          dropoffLongitude: sanitizedData.dropoffLng,
          
          pickupTime: pickupTime,
          returnTime: returnTime,
          initials: sanitizedData.initials || [],
          
          // Link to accessibility profile
          accessibilityProfile: {
            connect: { id: accessibilityProfile.id },
          },
          
          // Visibility for public bookings
          visibility: "PUBLIC",
          
          // Link to user (no business for public users)
          createdBy: { connect: { id: session.user.id } },
        },
      });

      return { booking, accessibilityProfile };
    });

    console.log(`✅ Public booking created:`, result.booking.id);

    try {
  const matchedDrivers = await matchDriverToBookingsCached(result.booking.id);
  
  if (matchedDrivers.length > 0) {
    console.log(`✅ Found ${matchedDrivers.length} matching drivers for public booking`);
    console.log('Top 3 matches:', matchedDrivers.slice(0, 3).map(d => ({
      name: d.name,
      score: d.matchScore,
      distance: d.distance?.toFixed(1) + ' miles'
    })));
  }
} catch (matchError) {
  console.error('❌ Matcher error:', matchError.message);
}


    return {
      success: true,
      bookingId: result.booking.id,
      message: "Booking created successfully. Drivers are being notified.",
      vehicleType: finalVehicleType,
      coordinates: {
        pickup: { lat: sanitizedData.pickupLat, lng: sanitizedData.pickupLng },
        dropoff: { lat: sanitizedData.dropoffLat, lng: sanitizedData.dropoffLng }
      }
    };
  } catch (error) {
    console.error("❌ Error creating public booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}