// app/actions/driver/driverDetails.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { DriverOnboardingSchema } from "@/lib/validators";

export async function completeDriverOnboarding(data) {
  try {
    // 1. Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // 2. Validate input
    const validated = DriverOnboardingSchema.parse(data);

    // 3. Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { driver: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // 4. Check if driver already exists
    if (user.driver) {
      return { success: false, error: "Driver profile already exists" };
    }

    // 5. Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create AccessibilityProfile
      const accessibilityProfile = await tx.accessibilityProfile.create({
        data: {
          wheelchairAccess: validated.wheelchairAccess,
          doubleWheelchairAccess: validated.doubleWheelchairAccess,
          highRoof: validated.highRoof,
          seatTransferHelp: validated.seatTransferHelp,
          mobilityAidStorage: validated.mobilityAidStorage,
          electricScooterStorage: validated.electricScooterStorage,
          
          passengerCount: validated.passengerCount,
          wheelchairUsers: validated.wheelchairUsers,
          ageOfPassenger: validated.ageOfPassenger,
          carerPresent: validated.carerPresent,
          escortRequired: validated.escortRequired,
          
          quietEnvironment: validated.quietEnvironment,
          noConversation: validated.noConversation,
          noScents: validated.noScents,
          specificMusic: validated.specificMusic || null,
          visualSchedule: validated.visualSchedule,
          
          signLanguageRequired: validated.signLanguageRequired,
          textOnlyCommunication: validated.textOnlyCommunication,
          preferredLanguage: validated.preferredLanguage || null,
          translationSupport: validated.translationSupport,
          
          assistanceRequired: validated.assistanceRequired,
          assistanceAnimal: validated.assistanceAnimal,
          familiarDriverOnly: validated.familiarDriverOnly,
          femaleDriverOnly: validated.femaleDriverOnly,
          nonWAVvehicle: validated.nonWAVvehicle,
          
          medicationOnBoard: validated.medicationOnBoard,
          medicalConditions: validated.medicalConditions || null,
          firstAidTrained: validated.firstAidTrained,
          conditionAwareness: validated.conditionAwareness,
          
          additionalNeeds: validated.additionalNeeds || null,
        },
      });

      // Step 2: Create Driver
      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          name: validated.name,
          vehicleType: validated.vehicleType,
          vehicleReg: validated.vehicleReg,
          amenities: validated.amenities || [],
          localPostcode: validated.localPostcode,
          radiusMiles: validated.radiusMiles,
          phone: validated.phone,
          approved: false, // Requires admin approval
          accessibilityProfileId: accessibilityProfile.id,
        },
      });

      // Step 3: Create DriverCompliance
      await tx.driverCompliance.create({
        data: {
          driverId: driver.id,
          ukDrivingLicence: validated.ukDrivingLicence,
          licenceNumber: validated.licenceNumber,
          localAuthorityRegistered: validated.localAuthorityRegistered,
          dbsChecked: validated.dbsChecked,
          publicLiabilityInsurance: validated.publicLiabilityInsurance,
          fullyCompInsurance: validated.fullyCompInsurance,
          healthCheckPassed: validated.healthCheckPassed,
          englishProficiency: validated.englishProficiency,
        },
      });

      // Step 4: Mark user as onboarded
      await tx.user.update({
        where: { id: user.id },
        data: { driverOnboarded: true },
      });

      return driver;
    });

    console.log("✅ Driver onboarding complete:", result.id);

    return { success: true, driverId: result.id };
  } catch (error) {
    console.error("❌ Driver onboarding failed:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error.message || "Failed to complete onboarding",
    };
  }
}

// Keep your existing completeOnboarding function for other roles
export async function completeOnboarding(role) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Unauthenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { success: false, error: "User not found" };

  try {
    const updateData = {};

    if (role === "DRIVER") updateData.driverOnboarded = true;
    if (role === "ADMIN") updateData.adminOnboarded = true;
    if (role === "COORDINATOR") updateData.coordinatorOnboarded = true;
    if (role === "MANAGER") updateData.managerOnboarded = true;

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to complete onboarding:", err);
    return { success: false, error: err.message };
  }
}

// NEW: Update existing driver details
export async function updateDriverDetails(data, driverId) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate input
    const validated = DriverOnboardingSchema.parse(data);

    // Get driver with relations
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
        accessibilityProfile: true,
        compliance: true,
      },
    });

    if (!driver) {
      return { success: false, error: "Driver not found" };
    }

    // Check ownership
    if (driver.user.email !== session.user.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update Driver
      await tx.driver.update({
        where: { id: driverId },
        data: {
          name: validated.name,
          vehicleType: validated.vehicleType,
          vehicleReg: validated.vehicleReg,
          amenities: validated.amenities || [],
          localPostcode: validated.localPostcode,
          radiusMiles: validated.radiusMiles,
          phone: validated.phone,
        },
      });

      // Update AccessibilityProfile
      await tx.accessibilityProfile.update({
        where: { id: driver.accessibilityProfileId },
        data: {
          wheelchairAccess: validated.wheelchairAccess,
          doubleWheelchairAccess: validated.doubleWheelchairAccess,
          highRoof: validated.highRoof,
          seatTransferHelp: validated.seatTransferHelp,
          mobilityAidStorage: validated.mobilityAidStorage,
          electricScooterStorage: validated.electricScooterStorage,
          
          passengerCount: validated.passengerCount,
          wheelchairUsers: validated.wheelchairUsers,
          ageOfPassenger: validated.ageOfPassenger,
          carerPresent: validated.carerPresent,
          escortRequired: validated.escortRequired,
          
          quietEnvironment: validated.quietEnvironment,
          noConversation: validated.noConversation,
          noScents: validated.noScents,
          specificMusic: validated.specificMusic || null,
          visualSchedule: validated.visualSchedule,
          
          signLanguageRequired: validated.signLanguageRequired,
          textOnlyCommunication: validated.textOnlyCommunication,
          preferredLanguage: validated.preferredLanguage || null,
          translationSupport: validated.translationSupport,
          
          assistanceRequired: validated.assistanceRequired,
          assistanceAnimal: validated.assistanceAnimal,
          familiarDriverOnly: validated.familiarDriverOnly,
          femaleDriverOnly: validated.femaleDriverOnly,
          nonWAVvehicle: validated.nonWAVvehicle,
          
          medicationOnBoard: validated.medicationOnBoard,
          medicalConditions: validated.medicalConditions || null,
          firstAidTrained: validated.firstAidTrained,
          conditionAwareness: validated.conditionAwareness,
          
          additionalNeeds: validated.additionalNeeds || null,
        },
      });

      // Update DriverCompliance
      await tx.driverCompliance.update({
        where: { driverId },
        data: {
          ukDrivingLicence: validated.ukDrivingLicence,
          licenceNumber: validated.licenceNumber,
          localAuthorityRegistered: validated.localAuthorityRegistered,
          dbsChecked: validated.dbsChecked,
          publicLiabilityInsurance: validated.publicLiabilityInsurance,
          fullyCompInsurance: validated.fullyCompInsurance,
          healthCheckPassed: validated.healthCheckPassed,
          englishProficiency: validated.englishProficiency,
        },
      });
    });

    console.log("✅ Driver details updated:", driverId);

    return { success: true };
  } catch (error) {
    console.error("❌ Update failed:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error.message || "Failed to update details",
    };
  }
}