// app/actions/bookings/createManagerBooking.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function createManagerBooking(data) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate required fields
    if (!data.houseId || !data.residentId) {
      return { success: false, error: "House and resident are required" };
    }

    if (!data.pickupTime || !data.pickupLocation || !data.dropoffLocation) {
      return { success: false, error: "Missing required booking details" };
    }

    // Verify house and resident exist
    const resident = await prisma.resident.findUnique({
      where: { id: data.residentId },
      include: { house: true },
    });

    if (!resident || resident.houseId !== data.houseId) {
      return { success: false, error: "Invalid house or resident" };
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        type: "ADVANCED", // Manager bookings are always advanced
        status: "PENDING", // Awaiting bids
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        pickupPostcode: data.pickupPostcode,
        dropoffPostcode: data.dropoffPostcode,
        pickupTime: data.pickupTime,
        returnTime: data.returnTime || null,
        roundTrip: data.roundTrip || false,
        passengerCount: data.passengerCount,
        wheelchairUsers: data.wheelchairUsers || 0,
        
        // Accessibility
        wheelchairAccess: data.wheelchairAccess || false,
        carerPresent: data.carerPresent || false,
        nonWAVvehicle: data.nonWAVvehicle || false,
        femaleDriverOnly: data.femaleDriverOnly || false,
        quietEnvironment: data.quietEnvironment || false,
        assistanceRequired: data.assistanceRequired || false,
        noConversation: data.noConversation || false,
        visualSchedule: data.visualSchedule || false,
        assistanceAnimal: data.assistanceAnimal || false,
        familiarDriverOnly: data.familiarDriverOnly || false,
        escortRequired: data.escortRequired || false,
        signLanguageRequired: data.signLanguageRequired || false,
        textOnlyCommunication: data.textOnlyCommunication || false,
        medicationOnBoard: data.medicationOnBoard || false,
        
        physicalRequirements: data.physicalRequirements || [],
        additionalNeeds: data.additionalNeeds || "",
        managerNotes: data.managerNotes || "",
        
        // Link to resident and house
        residentId: data.residentId,
        houseId: data.houseId,
        
        // Track who created it
        createdBy: session.user.email,
      },
    });

    // Create audit log entry for CQC compliance
    await prisma.auditLog.create({
      data: {
        action: "CREATE_BOOKING",
        entityType: "BOOKING",
        entityId: booking.id,
        userId: session.user.id,
        details: {
          bookingId: booking.id,
          residentId: data.residentId,
          residentName: resident.name,
          houseName: resident.house.name,
          pickupTime: data.pickupTime.toISOString(),
          managerEmail: session.user.email,
        },
      },
    });

    return {
      success: true,
      bookingId: booking.id,
      message: "Booking created successfully. Drivers can now bid.",
    };
  } catch (error) {
    console.error("❌ Error creating manager booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}