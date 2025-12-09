// app/api/driver/profile/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { invalidateDriverCache } from '@/lib/matching/cached-matching-algorithm';
// Move geocoding function outside the handler
async function geocodePostcode(postcode) {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await res.json();
    if (data.status === 200) {
      return {
        lat: data.result.latitude,
        lng: data.result.longitude,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      // Personal
      name,
      email,
      phone,
      gender, // ✅ Add this to destructuring
      // Vehicle
      vehicleClass,
      vehicleReg,
      // Location
      localPostcode,
      radiusMiles,
      // ... rest of your fields
      wheelchairAccess,
      doubleWheelchairAccess,
      // ... all the accessibility fields
    } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (!vehicleClass || !vehicleReg) {
      return NextResponse.json(
        { success: false, error: "Vehicle type and registration are required" },
        { status: 400 }
      );
    }

    if (!localPostcode || !radiusMiles) {
      return NextResponse.json(
        { success: false, error: "Postcode and service radius are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ✅ Fetch user FIRST
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        driver: {
          include: {
            accessibilityProfile: true,
            compliance: true,
          },
        },
      },
    });

    if (!user || !user.driver) {
      return NextResponse.json(
        { success: false, error: "Driver profile not found" },
        { status: 404 }
      );
    }

    // Check email uniqueness
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // ✅ NOW check if postcode changed and geocode
    let coordinates = {};
    if (localPostcode.trim().toUpperCase() !== user.driver.localPostcode) {
      console.log('Postcode changed, geocoding...', localPostcode);
      const coords = await geocodePostcode(localPostcode.trim());
      if (coords) {
        coordinates = {
          baseLat: coords.lat,
          baseLng: coords.lng,
        };
        console.log('Geocoded to:', coordinates);
      }
    }

    // Update user
await prisma.user.update({
  where: { id: session.user.id },
  data: {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
  },
});

// ✅ Update driver with ALL fields
await prisma.driver.update({
  where: { id: user.driver.id },
  data: {
    name: name.trim(),
    phone: phone.trim(),
    vehicleClass: vehicleClass.trim(), // ✅ Changed from vehicleType
    // REMOVED hasWAV, hasStandard, wavOnly - they don't exist anymore
    vehicleReg: vehicleReg.trim().toUpperCase(),
    localPostcode: localPostcode.trim().toUpperCase(),
    radiusMiles: parseInt(radiusMiles),
    gender: gender?.toLowerCase() || null,
    ...coordinates,
  },
});

// Update accessibility profile
await prisma.accessibilityProfile.update({
  where: { id: user.driver.accessibilityProfileId },
  data: {
    // Mobility & Physical
    // REMOVED wheelchairAccess, doubleWheelchairAccess
    highRoof: body.highRoof || false,
    seatTransferHelp: body.seatTransferHelp || false,
    mobilityAidStorage: body.mobilityAidStorage || false,
    electricScooterStorage: body.electricScooterStorage || false,
    
    // Passenger details - NEW FIELD NAMES
    ambulatoryPassengers: body.passengerCount || 1,
    wheelchairUsersStaySeated: body.wheelchairUsers || 0,
    wheelchairUsersCanTransfer: 0, // Add default
    ageOfPassenger: body.ageOfPassenger || null,
    carerPresent: body.carerPresent || false,
    escortRequired: body.escortRequired || false,
    
    // Sensory
    quietEnvironment: body.quietEnvironment || false,
    noConversation: body.noConversation || false,
    noScents: body.noScents || false,
    specificMusic: body.specificMusic || null,
    visualSchedule: body.visualSchedule || false,
    
    // Communication
    signLanguageRequired: body.signLanguageRequired || false,
    textOnlyCommunication: body.textOnlyCommunication || false,
    preferredLanguage: body.preferredLanguage || null,
    translationSupport: body.translationSupport || false,
    
    // Special requirements
    assistanceRequired: body.assistanceRequired || false,
    assistanceAnimal: body.assistanceAnimal || false,
    familiarDriverOnly: body.familiarDriverOnly || false,
    femaleDriverOnly: body.femaleDriverOnly || false,
    nonWAVvehicle: body.nonWAVvehicle || false,
    
    // Health & Safety
    medicationOnBoard: body.medicationOnBoard || false,
    medicalConditions: body.medicalConditions || null,
    firstAidTrained: body.firstAidTrained || false,
    conditionAwareness: body.conditionAwareness || false,
    
    additionalNeeds: body.additionalNeeds || null,
  },
});

    // Update or create compliance record
    if (user.driver.compliance) {
      await prisma.driverCompliance.update({
        where: { id: user.driver.compliance.id },
        data: {
          // ... your existing compliance updates
        },
      });
    } else {
      await prisma.driverCompliance.create({
        data: {
          driverId: user.driver.id,
          // ... your existing compliance data
        },
      });
    }
    await invalidateDriverCache(user.driver.id);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}