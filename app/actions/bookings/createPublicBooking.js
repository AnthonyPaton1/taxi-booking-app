"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function createPublicBooking(formData) {
  const session = await getServerSession(authOptions);

  if (!session) throw new Error("Unauthorized");

  if (!formData.pickupLocation || !formData.dropoffLocation) {
    throw new Error("Missing pickup or dropoff location");
  }

  // Normalize pickup/return times
  const pickupTime = new Date(formData.pickupTime);
  if (isNaN(pickupTime)) throw new Error("Invalid pickup time");

  const returnTime = formData.returnTime
    ? new Date(formData.returnTime)
    : null;

  // Decide type (INSTANT = today, ADVANCED = future date)
  const todayStr = new Date().toISOString().split("T")[0];
  const isInstant = formData.pickupDate === todayStr;

  try {
    const data = {
      createdBy: { connect: { id: session.user.id } },
      pickupTime,
      returnTime,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      passengerCount: Number(formData.passengerCount) || 1,
      wheelchairUsers: Number(formData.wheelchairUsers) || 0,

      // Accessibility
      wheelchairAccess: formData.wheelchairAccess || false,
      doubleWheelchairAccess: formData.doubleWheelchairAccess || false,
      highRoof: formData.highRoof || false,
      carerPresent: formData.carerPresent || false,
      nonWAVvehicle: formData.nonWAVvehicle || false,
      femaleDriverOnly: formData.femaleDriverOnly || false,
      quietEnvironment: formData.quietEnvironment || false,
      assistanceRequired: formData.assistanceRequired || false,
      noConversation: formData.noConversation || false,
      specificMusic: formData.specificMusic || null,
      electricScooterStorage: formData.electricScooterStorage || false,
      visualSchedule: formData.visualSchedule || false,
      assistanceAnimal: formData.assistanceAnimal || false,
      familiarDriverOnly: formData.familiarDriverOnly || false,
      ageOfPassenger: formData.ageOfPassenger || null,
      escortRequired: formData.escortRequired || false,
      preferredLanguage: formData.preferredLanguage || null,
      signLanguageRequired: formData.signLanguageRequired || false,
      textOnlyCommunication: formData.textOnlyCommunication || false,
      medicalConditions: formData.medicalConditions || null,
      medicationOnBoard: formData.medicationOnBoard || false,
      additionalNeeds: formData.additionalNeeds || "",
    };

    let newBooking;
    if (isInstant) {
      newBooking = await prisma.instantBooking.create({ data });
    } else {
      newBooking = await prisma.advancedBooking.create({ data });
    }

    return {
      success: true,
      bookingId: newBooking.id,
      type: isInstant ? "INSTANT" : "ADVANCED",
    };
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return { success: false, error: error.message };
  }
}
