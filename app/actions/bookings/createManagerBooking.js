// app/actions/bookings/createManagerBooking.js
"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { matchDriverToBookingsCached } from '@/lib/matching/cached-matching-algorithm';
import { sanitizeBookingData, validateResidentIds } from "@/lib/validation";

export async function createManagerBooking(data) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    // ===== INPUT SANITIZATION & VALIDATION =====
    let sanitizedData;
    try {
      sanitizedData = sanitizeBookingData(data);
    } catch (validationError) {
      return { success: false, error: validationError.message };
    }

    // Validate required fields
    if (!sanitizedData.houseId || !sanitizedData.residentIds || sanitizedData.residentIds.length === 0) {
      return { success: false, error: "A House and at least one resident are required" };
    }

    // Validate resident IDs
    const residentValidation = validateResidentIds(sanitizedData.residentIds);
    if (!residentValidation.valid) {
      return { success: false, error: residentValidation.error };
    }

    if (!sanitizedData.pickupTime || !sanitizedData.pickupLocation || !sanitizedData.dropoffLocation) {
      return { success: false, error: "Missing required booking details" };
    }

    // Verify house and residents exist
    const residents = await prisma.resident.findMany({
      where: { 
        id: { in: sanitizedData.residentIds },
        houseId: sanitizedData.houseId
      },
    });

    if (residents.length !== sanitizedData.residentIds.length) {
      return { success: false, error: "One or more residents not found or not in selected house" };
    }

    // Get all resident initials
    const residentInitials = residents.map(r => r.initials).filter(Boolean);

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return { success: false, error: "Business not found" };
    }

    // Get house for coordinates
    const house = await prisma.house.findUnique({
      where: { id: sanitizedData.houseId },
      select: {
        line1: true,
        city: true,
        postcode: true,
        lat: true,
        lng: true,
      }
    });

    if (!house) {
      return { success: false, error: "House not found" };
    }

    // Validate house has coordinates
    if (!house.lat || !house.lng) {
      return { 
        success: false, 
        error: "House does not have valid coordinates. Please update the house address in settings." 
      };
    }

    const vehicleTypeMap = {
  'wav': 'SIDE_LOADING_WAV',
  'car': 'STANDARD_CAR',
  'either': 'STANDARD_CAR',
  'standard': 'STANDARD_CAR',
  'large': 'LARGE_CAR',
  // Keep enum values as-is if already correct
  'STANDARD_CAR': 'STANDARD_CAR',
  'LARGE_CAR': 'LARGE_CAR',
  'SIDE_LOADING_WAV': 'SIDE_LOADING_WAV',
  'REAR_LOADING_WAV': 'REAR_LOADING_WAV',
  'DOUBLE_WAV': 'DOUBLE_WAV',
  'MINIBUS_STANDARD': 'MINIBUS_STANDARD',
  'MINIBUS_ACCESSIBLE': 'MINIBUS_ACCESSIBLE',
};

    // Vehicle type handling with proper fallback
    const vehicleType = sanitizedData.vehicleType || 'either';
    let finalVehicleType = vehicleTypeMap[vehicleType] || 'STANDARD_CAR';
    
   
// Smart logic: if wheelchairs but they said "car", upgrade to WAV
if (sanitizedData.wheelchairUsers > 0 && finalVehicleType === 'STANDARD_CAR') {
  // Use wheelchair config to determine best WAV type
  if (sanitizedData.wheelchairConfig?.requiresDoubleWAV || sanitizedData.wheelchairUsers >= 2) {
    finalVehicleType = 'DOUBLE_WAV';
  } else if (sanitizedData.wheelchairConfig?.requiresRearLoading) {
    finalVehicleType = 'REAR_LOADING_WAV';
  } else {
    finalVehicleType = 'SIDE_LOADING_WAV'; // Default WAV
  }
}
   

    // Step 1: Create AccessibilityProfile with vehicle type (using sanitized data)
    const accessibilityProfile = await prisma.accessibilityProfile.create({
      data: {
    vehicleClassRequired: finalVehicleType, // ✅ CHANGED from vehicleType
    
    // Passenger details - UPDATED FIELD NAMES
    ambulatoryPassengers: parseInt(sanitizedData.passengerCount) || 1,
    wheelchairUsersStaySeated: parseInt(sanitizedData.wheelchairUsers) || 0,
    wheelchairUsersCanTransfer: 0, // Default
    carerPresent: sanitizedData.carerPresent || false,
    escortRequired: sanitizedData.escortRequired || false,
    
    // Mobility & Physical
    highRoof: sanitizedData.highRoof || false,
    seatTransferHelp: sanitizedData.seatTransferHelp || false,
    mobilityAidStorage: sanitizedData.mobilityAidStorage || false,
    electricScooterStorage: sanitizedData.electricScooterStorage || false,

        // Sensory preferences
        quietEnvironment: sanitizedData.quietEnvironment || false,
        noConversation: sanitizedData.noConversation || false,
        noScents: sanitizedData.noScents || false,
        visualSchedule: sanitizedData.visualSchedule || false,
        
        // Communication
        signLanguageRequired: sanitizedData.signLanguageRequired || false,
        textOnlyCommunication: sanitizedData.textOnlyCommunication || false,
        
        // Special requirements
        assistanceRequired: sanitizedData.assistanceRequired || false,
        assistanceAnimal: sanitizedData.assistanceAnimal || false,
        familiarDriverOnly: sanitizedData.familiarDriverOnly || false,
        femaleDriverOnly: sanitizedData.femaleDriverOnly || false,
        nonWAVvehicle: sanitizedData.nonWAVvehicle || false,
        
        // Health & safety
        medicationOnBoard: sanitizedData.medicationOnBoard || false,
        firstAidTrained: sanitizedData.firstAidTrained || false,
        
        // Additional (SANITIZED)
        additionalNeeds: sanitizedData.additionalNeeds || null,
      },
    });

    // Step 2: Calculate bid deadline (48 hours before pickup)
    const pickupTime = new Date(sanitizedData.pickupTime);

    // Step 3: Create the AdvancedBooking with accessibility profile (using sanitized data)
    const booking = await prisma.booking.create({
      data: {
        status: "PENDING",
        
        // Use sanitized location strings and validated coordinates
        pickupLocation: sanitizedData.pickupLocation,
        pickupLatitude: house.lat,   
        pickupLongitude: house.lng,  
        
        dropoffLocation: sanitizedData.dropoffLocation,
        dropoffLatitude: sanitizedData.dropoffLat,   
        dropoffLongitude: sanitizedData.dropoffLng,  
        
        pickupTime: pickupTime,
        returnTime: sanitizedData.returnTime ? new Date(sanitizedData.returnTime) : null,
        initials: residentInitials,

        // Link to accessibility profile
        accessibilityProfile: {
          connect: { id: accessibilityProfile.id },
        },
        
        // Bidding settings
        visibility: "PRIVATE_TO_COMPANY",
        
        
        // Relations
        createdBy: { connect: { id: session.user.id } },
        business: { connect: { id: user.businessId } },
      },
    });

    try {
      const matchedDrivers =  matchDriverToBookingsCached(booking.id);
      
      if (matchedDrivers.length > 0) {
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
      bookingId: booking.id,
      message: "Booking created successfully. Drivers can now bid.",
      vehicleType: finalVehicleType,
      usedHouseCoordinates: true,
      coordinates: {
        pickup: { lat: house.lat, lng: house.lng },
        dropoff: { lat: sanitizedData.dropoffLat, lng: sanitizedData.dropoffLng }
      }
    };
  } catch (error) {
    console.error("❌ Error creating manager booking:", error);
    return { 
      success: false, 
      error: "Failed to create booking. Please try again." 
    };
  }
}