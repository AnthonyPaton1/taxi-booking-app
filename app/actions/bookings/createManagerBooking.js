// app/actions/bookings/createManagerBooking.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { findMatchingDrivers } from "@/lib/matching/bookingMatcher";

export async function createManagerBooking(data) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate required fields
    if (!data.houseId || !data.residentIds || data.residentIds.length === 0) {
      return { success: false, error: "House and at least one resident are required" };
    }

    if (!data.pickupTime || !data.pickupLocation || !data.dropoffLocation) {
      return { success: false, error: "Missing required booking details" };
    }

    // Verify house and residents exist
    const residents = await prisma.resident.findMany({
      where: { 
        id: { in: data.residentIds },
        houseId: data.houseId
      },
    });

    if (residents.length !== data.residentIds.length) {
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
      where: { id: data.houseId },
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

    // Vehicle type handling with proper fallback
    const vehicleType = data.vehicleType || 'either';
    
    // If wheelchair user is checked but vehicle type is not WAV, auto-set to WAV
    const finalVehicleType = data.wheelchairAccess && vehicleType === 'either' 
      ? 'wav' 
      : vehicleType;

    console.log('📍 Using house coordinates for pickup:', {
      houseId: data.houseId,
      address: house.address,
      lat: house.lat,
      lng: house.lng,
      vehicleType: finalVehicleType
    });

    // Step 1: Create AccessibilityProfile with vehicle type
    const accessibilityProfile = await prisma.accessibilityProfile.create({
      data: {
        // ===== NEW: Vehicle Type =====
        vehicleType: finalVehicleType, // 'wav', 'standard', or 'either'
        
        // Passenger details
        passengerCount: parseInt(data.passengerCount) || 1,
        wheelchairUsers: parseInt(data.wheelchairUsers) || 0,
        carerPresent: data.carerPresent || false,
        escortRequired: data.escortRequired || false,
        
        // Mobility & Physical
        wheelchairAccess: data.wheelchairAccess || false,
        doubleWheelchairAccess: data.doubleWheelchairAccess || false,
        highRoof: data.highRoof || false,
        seatTransferHelp: data.seatTransferHelp || false,
        mobilityAidStorage: data.mobilityAidStorage || false,
        electricScooterStorage: data.electricScooterStorage || false,
        
        // Sensory preferences
        quietEnvironment: data.quietEnvironment || false,
        noConversation: data.noConversation || false,
        noScents: data.noScents || false,
        visualSchedule: data.visualSchedule || false,
        
        // Communication
        signLanguageRequired: data.signLanguageRequired || false,
        textOnlyCommunication: data.textOnlyCommunication || false,
        
        // Special requirements
        assistanceRequired: data.assistanceRequired || false,
        assistanceAnimal: data.assistanceAnimal || false,
        familiarDriverOnly: data.familiarDriverOnly || false,
        
        // ===== UPDATED: Female Driver (Preference, not requirement) =====
        femaleDriverOnly: data.femaleDriverOnly || false, // Soft preference
        
        nonWAVvehicle: data.nonWAVvehicle || false,
        
        // Health & safety
        medicationOnBoard: data.medicationOnBoard || false,
        firstAidTrained: data.firstAidTrained || false,
        
        // Additional
        additionalNeeds: data.additionalNeeds || null,
      },
    });
    

    // Step 2: Calculate bid deadline (48 hours before pickup)
    const pickupTime = new Date(data.pickupTime);
    const bidDeadline = new Date(pickupTime.getTime() - (48 * 60 * 60 * 1000)); // 48 hours before

    // Step 3: Create the AdvancedBooking with accessibility profile
    const booking = await prisma.advancedBooking.create({
      data: {
        status: "OPEN", // Available for bidding
        
        // ===== UPDATED: Use house coordinates for pickup =====
        pickupLocation: data.pickupLocation,
        pickupLatitude: house.lat,   
        pickupLongitude: house.lng,  
        
        dropoffLocation: data.dropoffLocation,
        dropoffLatitude: data.dropoffLat,   
        dropoffLongitude: data.dropoffLng,  
        
        pickupTime: pickupTime,
        returnTime: data.returnTime ? new Date(data.returnTime) : null,
        initials: residentInitials, // Array of resident initials
        
        // Link to accessibility profile
        accessibilityProfile: {
          connect: { id: accessibilityProfile.id },
        },
        
        // Bidding settings
        visibility: "PRIVATE_TO_COMPANY", // or "PUBLIC" if you want
        bidDeadline: bidDeadline,
        
        // Relations
        createdBy: { connect: { id: session.user.id } },
        business: { connect: { id: user.businessId } },
      },
    });

    console.log(`\n🔍 Finding matching drivers for booking ${booking.id}...`);

        try {
      const matchedDrivers = await findMatchingDrivers(booking.id);
      console.log(`✅ Found ${matchedDrivers.length} matching drivers`);
      
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
        dropoff: { lat: data.dropoffLat, lng: data.dropoffLng }
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