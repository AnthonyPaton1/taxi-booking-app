// app/api/onboarding/driver/route.js - UPDATED for vehicleClass
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DriverOnboardingSchema } from "@/lib/validators";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const validated = DriverOnboardingSchema.parse(body);

    // ✅ Derive vehicle capabilities from vehicleClass
    const vehicleClass = validated.vehicleClass;
    
    // Determine if vehicle has WAV capabilities
    const wavClasses = ['SIDE_LOADING_WAV', 'REAR_LOADING_WAV', 'DOUBLE_WAV', 'MINIBUS_ACCESSIBLE'];
    const hasWAV = wavClasses.includes(vehicleClass);
    
    // Determine if it's standard (no wheelchair access)
    const standardClasses = ['STANDARD_CAR', 'LARGE_CAR', 'MINIBUS_STANDARD'];
    const hasStandard = standardClasses.includes(vehicleClass);

    // Create the driver
    const driver = await prisma.driver.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        vehicleClass: validated.vehicleClass, // ✅ UPDATED: Use vehicleClass
        vehicleReg: validated.vehicleReg,
        phone: validated.phone,

        // ✅ Base location coordinates
        localPostcode: validated.localPostcode,
        baseLat: validated.baseLat,
        baseLng: validated.baseLng,
        radiusMiles: validated.radiusMiles,

        // ✅ Vehicle capability booleans (derived from vehicleClass)
        hasWAV: hasWAV,
        hasStandard: hasStandard,
        wavOnly: hasWAV && !hasStandard, // WAV-only if it's a WAV and not a standard vehicle

        // Vehicle amenities
        amenities: validated.amenities,

        approved: false, // Admin must approve

        // Create AccessibilityProfile
        accessibilityProfile: {
          create: {
            // Mobility & Physical (matching schema)
            highRoof: validated.highRoof ?? false,
            seatTransferHelp: validated.seatTransferHelp ?? false,
            mobilityAidStorage: validated.mobilityAidStorage ?? false,
            electricScooterStorage: validated.electricScooterStorage ?? false,

            // Passenger counts (using schema's field names)
            wheelchairUsersStaySeated: 0, // Default, can be set later
            wheelchairUsersCanTransfer: 0, // Default, can be set later
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
        },

        // Create DriverCompliance
        compliance: {
          create: {
            ukDrivingLicence: validated.ukDrivingLicence,
            localAuthorityRegistered: validated.localAuthorityRegistered,
            dbsChecked: validated.dbsChecked,
            publicLiabilityInsurance: validated.publicLiabilityInsurance,
            fullyCompInsurance: validated.fullyCompInsurance,
            healthCheckPassed: validated.healthCheckPassed,
            englishProficiency: validated.englishProficiency,
            licenceNumber: validated.licenceNumber,
            
            // ✅ NEW: DBS Update Service fields
            dbsIssueDate: validated.dbsIssueDate,
            dbsUpdateServiceNumber: validated.dbsUpdateServiceNumber,
            dbsUpdateServiceConsent: validated.dbsUpdateServiceConsent,
          },
        },
      },
    });

    // ✅ CRITICAL: Update User.onboarded to TRUE
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboarded: true }
    });

    return Response.json({ success: true, driver });
  } catch (err) {
    console.error("❌ Onboarding error:", err);
    
    // Better error messaging
    if (err.name === 'ZodError') {
      return Response.json({ 
        error: "Validation failed", 
        details: err.errors 
      }, { status: 400 });
    }
    
    return Response.json({ 
      error: err.message || "Invalid input or server error." 
    }, { status: 400 });
  }
}