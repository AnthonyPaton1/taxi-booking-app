// app/actions/bookings/createPublicBooking.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function createPublicBooking(formData) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // 2. Validate required fields
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      return { success: false, error: "Missing pickup or dropoff location" };
    }

    // 3. Normalize times
    const pickupTime = new Date(formData.pickupTime);
    if (isNaN(pickupTime.getTime())) {
      return { success: false, error: "Invalid pickup time" };
    }

    const returnTime = formData.returnTime
      ? new Date(formData.returnTime)
      : null;

    // 4. Decide booking type (INSTANT = today, ADVANCED = future)
    const todayStr = new Date().toISOString().split("T")[0];
    const isInstant = formData.pickupDate === todayStr;

    // 5. Create booking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create AccessibilityProfile
      const accessibilityProfile = await tx.accessibilityProfile.create({
        data: {
          // Mobility
          wheelchairAccess: formData.wheelchairAccess || false,
          doubleWheelchairAccess: formData.doubleWheelchairAccess || false,
          highRoof: formData.highRoof || false,
          seatTransferHelp: formData.seatTransferHelp || false,
          mobilityAidStorage: formData.mobilityAidStorage || false,
          electricScooterStorage: formData.electricScooterStorage || false,

          // Passenger details
          passengerCount: Number(formData.passengerCount) || 1,
          wheelchairUsers: Number(formData.wheelchairUsers) || 0,
          ageOfPassenger: formData.ageOfPassenger || null,
          carerPresent: formData.carerPresent || false,
          escortRequired: formData.escortRequired || false,

          // Sensory
          quietEnvironment: formData.quietEnvironment || false,
          noConversation: formData.noConversation || false,
          noScents: formData.noScents || false,
          specificMusic: formData.specificMusic || null,
          visualSchedule: formData.visualSchedule || false,

          // Communication
          signLanguageRequired: formData.signLanguageRequired || false,
          textOnlyCommunication: formData.textOnlyCommunication || false,
          preferredLanguage: formData.preferredLanguage || null,
          translationSupport: formData.translationSupport || false,

          // Special requirements
          assistanceRequired: formData.assistanceRequired || false,
          assistanceAnimal: formData.assistanceAnimal || false,
          familiarDriverOnly: formData.familiarDriverOnly || false,
          femaleDriverOnly: formData.femaleDriverOnly || false,
          nonWAVvehicle: formData.nonWAVvehicle || false,

          // Health
          medicationOnBoard: formData.medicationOnBoard || false,
          medicalConditions: formData.medicalConditions || null,
          firstAidTrained: formData.firstAidTrained || false,
          conditionAwareness: formData.conditionAwareness || false,

          // Additional
          additionalNeeds: formData.additionalNeeds || null,
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
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
            initials: formData.initials || [], // Array of passenger initials
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
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
            initials: formData.initials || [],
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