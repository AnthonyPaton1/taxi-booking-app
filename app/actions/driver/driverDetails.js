// app/actions/driver/driverDetails.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { DriverOnboardingSchema } from "@/lib/validators";
import { invalidateDriverCache } from '@/lib/matching/cached-matching-algorithm';
import { encrypt } from '@/lib/encryption';

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
          
          baseLat: validated.baseLat,
          baseLng: validated.baseLng,
         
          
          // Vehicle type booleans
          hasWAV: validated.vehicleType === "WAV",
          hasStandard: validated.vehicleType === "CAR",
          wavOnly: validated.vehicleType === "WAV",
          
          phone: validated.phone,
          approved: false,
          accessibilityProfileId: accessibilityProfile.id,
        },
      });

      // Step 3: Create DriverCompliance (ENCRYPT SENSITIVE DATA)
      await tx.driverCompliance.create({
        data: {
          driverId: driver.id,
          ukDrivingLicence: validated.ukDrivingLicence,
          licenceNumber: encrypt(validated.licenceNumber), // 🔐 ENCRYPTED
          localAuthorityRegistered: validated.localAuthorityRegistered,
          dbsChecked: validated.dbsChecked,
          publicLiabilityInsurance: validated.publicLiabilityInsurance,
          fullyCompInsurance: validated.fullyCompInsurance,
          healthCheckPassed: validated.healthCheckPassed,
          englishProficiency: validated.englishProficiency,
          dbsIssueDate: new Date(validated.dbsIssueDate),
          dbsUpdateServiceNumber: encrypt(validated.dbsUpdateServiceNumber), // 🔐 ENCRYPTED
          dbsUpdateServiceConsent: validated.dbsUpdateServiceConsent,
          dbsUpdateServiceConsentDate: validated.dbsUpdateServiceConsent ? new Date() : null,
          lastDbsCheck: new Date(),
          nextDbsCheckDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          dbsStatus: 'CLEAR',
        },
      });

      // Step 4: Mark user as onboarded
      await tx.user.update({
        where: { id: user.id },
        data: { driverOnboarded: true },
      });

      return driver;
    });
    
    await invalidateDriverCache(result.id);

    console.log("✅ Driver onboarding complete:", result.id);

    return { success: true, driverId: result.id };
  } catch (error) {
    console.error("❌ Driver onboarding failed:", error);

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

export async function updateDriverDetails(data, driverId) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = DriverOnboardingSchema.parse(data);

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

    if (driver.user.email !== session.user.email) {
      return { success: false, error: "Unauthorized" };
    }

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
          
          baseLat: validated.baseLat,
          baseLng: validated.baseLng,
          
          
          hasWAV: validated.vehicleType === "WAV",
          hasStandard: validated.vehicleType === "CAR",
          wavOnly: validated.vehicleType === "WAV",
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

      // Update DriverCompliance (ENCRYPT SENSITIVE DATA)
      await tx.driverCompliance.update({
        where: { driverId },
        data: {
          ukDrivingLicence: validated.ukDrivingLicence,
          licenceNumber: encrypt(validated.licenceNumber), // 🔐 ENCRYPTED
          localAuthorityRegistered: validated.localAuthorityRegistered,
          dbsChecked: validated.dbsChecked,
          publicLiabilityInsurance: validated.publicLiabilityInsurance,
          fullyCompInsurance: validated.fullyCompInsurance,
          healthCheckPassed: validated.healthCheckPassed,
          englishProficiency: validated.englishProficiency,
          dbsIssueDate: new Date(validated.dbsIssueDate),
          dbsUpdateServiceNumber: encrypt(validated.dbsUpdateServiceNumber), // 🔐 ENCRYPTED
          dbsUpdateServiceConsent: validated.dbsUpdateServiceConsent,
          dbsUpdateServiceConsentDate: validated.dbsUpdateServiceConsent ? new Date() : null,
          lastDbsCheck: new Date(),
          nextDbsCheckDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          dbsStatus: 'CLEAR',
        },
      });
    });
    
    await invalidateDriverCache(driverId); // ✅ FIXED - use driverId, not result.id

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