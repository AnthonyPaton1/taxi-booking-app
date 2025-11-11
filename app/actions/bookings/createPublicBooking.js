// app/actions/bookings/createPublicBooking.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
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

    // 3. Normalize times
    const pickupTime = new Date(sanitizedData.pickupTime);
    if (isNaN(pickupTime.getTime())) {
      return { success: false, error: "Invalid pickup time" };
    }

    const returnTime = sanitizedData.returnTime
      ? new Date(sanitizedData.returnTime)
      : null;

    // 4. Decide booking type (INSTANT = today, ADVANCED = future)
    const todayStr = new Date().toISOString().split("T")[0];
    const isInstant = sanitizedData.pickupDate === todayStr;

    // 5. Create booking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create AccessibilityProfile (using sanitized data)
      const accessibilityProfile = await tx.accessibilityProfile.create({
        data: {
          // Mobility
          wheelchairAccess: sanitizedData.wheelchairAccess || false,
          doubleWheelchairAccess: sanitizedData.doubleWheelchairAccess || false,
          highRoof: sanitizedData.highRoof || false,
          seatTransferHelp: sanitizedData.seatTransferHelp || false,
          mobilityAidStorage: sanitizedData.mobilityAidStorage || false,
          electricScooterStorage: sanitizedData.electricScooterStorage || false,

          // Passenger details
          passengerCount: Number(sanitizedData.passengerCount) || 1,
          wheelchairUsers: Number(sanitizedData.wheelchairUsers) || 0,
          ageOfPassenger: sanitizedData.ageOfPassenger || null,
          carerPresent: sanitizedData.carerPresent || false,
          escortRequired: sanitizedData.escortRequired || false,

          // Sensory
          quietEnvironment: sanitizedData.quietEnvironment || false,
          noConversation: sanitizedData.noConversation || false,
          noScents: sanitizedData.noScents || false,
          specificMusic: sanitizedData.specificMusic || null, // SANITIZED
          visualSchedule: sanitizedData.visualSchedule || false,

          // Communication
          signLanguageRequired: sanitizedData.signLanguageRequired || false,
          textOnlyCommunication: sanitizedData.textOnlyCommunication || false,
          preferredLanguage: sanitizedData.preferredLanguage || null, // SANITIZED
          translationSupport: sanitizedData.translationSupport || false,

          // Special requirements
          assistanceRequired: sanitizedData.assistanceRequired || false,
          assistanceAnimal: sanitizedData.assistanceAnimal || false,
          familiarDriverOnly: sanitizedData.familiarDriverOnly || false,
          femaleDriverOnly: sanitizedData.femaleDriverOnly || false,
          nonWAVvehicle: sanitizedData.nonWAVvehicle || false,

          // Health
          medicationOnBoard: sanitizedData.medicationOnBoard || false,
          medicalConditions: sanitizedData.medicalConditions || null, // SANITIZED
          firstAidTrained: sanitizedData.firstAidTrained || false,
          conditionAwareness: sanitizedData.conditionAwareness || false,

          // Additional
          additionalNeeds: sanitizedData.additionalNeeds || null, // SANITIZED
        },
      });

      // Step 2: Create booking (Instant or Advanced)
      let booking;

      if (isInstant) {
        booking = await tx.instantBooking.create({
          data: {
            createdById: session.user.id,
            pickupTime,
            returnTime,
            pickupLocation: sanitizedData.pickupLocation, // SANITIZED
            dropoffLocation: sanitizedData.dropoffLocation, // SANITIZED
            initials: sanitizedData.initials || [], // Array of passenger initials
            status: "PENDING",
            accessibilityProfileId: accessibilityProfile.id,
          },
        });
      } else {
        // Calculate bid deadline (e.g., 24 hours before pickup)
        const bidDeadline = new Date(pickupTime);
        bidDeadline.setHours(bidDeadline.getHours() - 24);

        booking = await tx.advancedBooking.create({
          data: {
            createdById: session.user.id,
            pickupTime,
            returnTime,
            pickupLocation: sanitizedData.pickupLocation, // SANITIZED
            dropoffLocation: sanitizedData.dropoffLocation, // SANITIZED
            initials: sanitizedData.initials || [],
            status: "OPEN",
            visibility: "PUBLIC", // Public users create public bookings
            bidDeadline,
            accessibilityProfileId: accessibilityProfile.id,
          },
        });
      }

      return { booking, type: isInstant ? "INSTANT" : "ADVANCED" };
    });

    console.log(`✅ ${result.type} booking created:`, result.booking.id);

    return {
      success: true,
      bookingId: result.booking.id,
      type: result.type,
    };
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}