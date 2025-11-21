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

    // ✅ Derive vehicle capabilities from vehicleClass
    const vehicleClass = validated.vehicleClass;
    const wavClasses = ['SIDE_LOADING_WAV', 'REAR_LOADING_WAV', 'DOUBLE_WAV', 'MINIBUS_ACCESSIBLE'];
    const hasWAV = wavClasses.includes(vehicleClass);
    const standardClasses = ['STANDARD_CAR', 'LARGE_CAR', 'MINIBUS_STANDARD'];
    const hasStandard = standardClasses.includes(vehicleClass);

    // 5. Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create AccessibilityProfile (UPDATED - removed fields that don't exist)
      const accessibilityProfile = await tx.accessibilityProfile.create({
        data: {
          // Mobility & Physical
          highRoof: validated.highRoof ?? false,
          seatTransferHelp: validated.seatTransferHelp ?? false,
          mobilityAidStorage: validated.mobilityAidStorage ?? false,
          electricScooterStorage: validated.electricScooterStorage ?? false,
          
          // Passenger counts (using schema's field names)
          wheelchairUsersStaySeated: 0, // Default
          wheelchairUsersCanTransfer: 0, // Default
          ambulatoryPassengers: validated.passengerCount ?? 0,
          
          // Passenger details
          ageOfPassenger: validated.ageOfPassenger ?? null,
          carerPresent: validated.carerPresent ?? false,
          escortRequired: validated.escortRequired ?? false,
          
          // Sensory preferences
          quietEnvironment: validated.quietEnvironment ?? false,
          noConversation: validated.noConversation ?? false,
          noScents: validated.noScents ?? false,
          specificMusic: validated.specificMusic ?? null,
          visualSchedule: validated.visualSchedule ?? false,
          
          // Communication
          signLanguageRequired: validated.signLanguageRequired ?? false,
          textOnlyCommunication: validated.textOnlyCommunication ?? false,
          preferredLanguage: validated.preferredLanguage ?? null,
          translationSupport: validated.translationSupport ?? false,
          
          // Special requirements
          assistanceRequired: validated.assistanceRequired ?? false,
          assistanceAnimal: validated.assistanceAnimal ?? false,
          familiarDriverOnly: validated.familiarDriverOnly ?? false,
          femaleDriverOnly: validated.femaleDriverOnly ?? false,
          nonWAVvehicle: validated.nonWAVvehicle ?? false,
          
          // Health & safety
          medicationOnBoard: validated.medicationOnBoard ?? false,
          medicalConditions: validated.medicalConditions ?? null,
          firstAidTrained: validated.firstAidTrained ?? false,
          conditionAwareness: validated.conditionAwareness ?? false,
          
          // Additional
          additionalNeeds: validated.additionalNeeds ?? null,
        },
      });

      // Step 2: Create Driver (UPDATED - use vehicleClass)
      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          name: validated.name,
          vehicleClass: validated.vehicleClass,
          vehicleReg: validated.vehicleReg,
          amenities: validated.amenities || [],
          localPostcode: validated.localPostcode,
          radiusMiles: validated.radiusMiles,
          
          baseLat: validated.baseLat,
          baseLng: validated.baseLng,
          
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

    // ✅ Derive vehicle capabilities from vehicleClass
    const vehicleClass = validated.vehicleClass;
    const wavClasses = ['SIDE_LOADING_WAV', 'REAR_LOADING_WAV', 'DOUBLE_WAV', 'MINIBUS_ACCESSIBLE'];
    const hasWAV = wavClasses.includes(vehicleClass);
    const standardClasses = ['STANDARD_CAR', 'LARGE_CAR', 'MINIBUS_STANDARD'];
    const hasStandard = standardClasses.includes(vehicleClass);

    await prisma.$transaction(async (tx) => {
      // Update Driver (UPDATED - use vehicleClass)
      await tx.driver.update({
        where: { id: driverId },
        data: {
          name: validated.name,
          vehicleClass: validated.vehicleClass,
          vehicleReg: validated.vehicleReg,
          amenities: validated.amenities || [],
          localPostcode: validated.localPostcode,
          radiusMiles: validated.radiusMiles,
          phone: validated.phone,
          
          baseLat: validated.baseLat,
          baseLng: validated.baseLng,
        },
      });

      // Update AccessibilityProfile (UPDATED - removed fields)
      await tx.accessibilityProfile.update({
        where: { id: driver.accessibilityProfileId },
        data: {
          // Mobility & Physical
          highRoof: validated.highRoof ?? false,
          seatTransferHelp: validated.seatTransferHelp ?? false,
          mobilityAidStorage: validated.mobilityAidStorage ?? false,
          electricScooterStorage: validated.electricScooterStorage ?? false,
          
          // Passenger counts
          wheelchairUsersStaySeated: 0,
          wheelchairUsersCanTransfer: 0,
          ambulatoryPassengers: validated.passengerCount ?? 0,
          
          // Passenger details
          ageOfPassenger: validated.ageOfPassenger ?? null,
          carerPresent: validated.carerPresent ?? false,
          escortRequired: validated.escortRequired ?? false,
          
          // Sensory
          quietEnvironment: validated.quietEnvironment ?? false,
          noConversation: validated.noConversation ?? false,
          noScents: validated.noScents ?? false,
          specificMusic: validated.specificMusic ?? null,
          visualSchedule: validated.visualSchedule ?? false,
          
          // Communication
          signLanguageRequired: validated.signLanguageRequired ?? false,
          textOnlyCommunication: validated.textOnlyCommunication ?? false,
          preferredLanguage: validated.preferredLanguage ?? null,
          translationSupport: validated.translationSupport ?? false,
          
          // Special requirements
          assistanceRequired: validated.assistanceRequired ?? false,
          assistanceAnimal: validated.assistanceAnimal ?? false,
          familiarDriverOnly: validated.familiarDriverOnly ?? false,
          femaleDriverOnly: validated.femaleDriverOnly ?? false,
          nonWAVvehicle: validated.nonWAVvehicle ?? false,
          
          // Health & safety
          medicationOnBoard: validated.medicationOnBoard ?? false,
          medicalConditions: validated.medicalConditions ?? null,
          firstAidTrained: validated.firstAidTrained ?? false,
          conditionAwareness: validated.conditionAwareness ?? false,
          
          // Additional
          additionalNeeds: validated.additionalNeeds ?? null,
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
    
    await invalidateDriverCache(driverId);

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