// app/api/bookings/instant/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

     const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });
    
    // Validate required fields
    if (!data.pickupLocation || !data.dropoffLocation || !data.pickupTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Create AccessibilityProfile first
    const accessibilityProfile = await prisma.accessibilityProfile.create({
      data: {
        // Vehicle type
        vehicleType: data.vehicleType || 'either',
        
        // Core accessibility
        wheelchairAccess: data.wheelchairAccess || false,
        carerPresent: data.carerPresent || false,
        femaleDriverOnly: data.femaleDriverOnly || false,
        assistanceRequired: data.assistanceRequired || false,
        
        // Additional options
        quietEnvironment: data.quietEnvironment || false,
        noConversation: data.noConversation || false,
        visualSchedule: data.visualSchedule || false,
        assistanceAnimal: data.assistanceAnimal || false,
        familiarDriverOnly: data.familiarDriverOnly || false,
        escortRequired: data.escortRequired || false,
        signLanguageRequired: data.signLanguageRequired || false,
        textOnlyCommunication: data.textOnlyCommunication || false,
        medicationOnBoard: data.medicationOnBoard || false,
        
        // Passenger details
        passengerCount: parseInt(data.passengerCount) || 1,
        wheelchairUsers: parseInt(data.wheelchairUsers) || 0,
        
        // Text fields
        additionalNeeds: data.additionalNeeds || null,
      }
    });

    // Step 2: Create InstantBooking with connected profile
    const booking = await prisma.instantBooking.create({
      data: {
        status: "PENDING",
        
        // Location
        pickupLocation: data.pickupLocation,
        
        pickupLatitude: data.pickupLat,
        pickupLongitude: data.pickupLng,
        dropoffLocation: data.dropoffLocation,
        
        dropoffLatitude: data.dropoffLat,
        dropoffLongitude: data.dropoffLng,
        
        // Time
        pickupTime: new Date(data.pickupTime),
        returnTime: data.returnTime ? new Date(data.returnTime) : null,
        
        // Connect accessibility profile
        accessibilityProfile: {
          connect: { id: accessibilityProfile.id }
        },
        
        // Relations (if you have these fields)
        createdBy: { connect: { id: session.user.id } },
        business: { connect: { id: user.businessId } },
      }
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });

  } catch (error) {
    console.error("Error creating instant booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 }
    );
  }
}