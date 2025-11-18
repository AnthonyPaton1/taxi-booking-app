// app/api/onboarding/driver/route.js - COMPLETE FIX
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

    // ✅ Derive boolean flags from vehicleType
    const isWAV = validated.vehicleType === "WAV";
    const isStandard = validated.vehicleType === "CAR";
    const isMinibus = validated.vehicleType === "MINIBUS";

    // Create the driver
    const driver = await prisma.driver.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        vehicleType: validated.vehicleType,
        vehicleReg: validated.vehicleReg,
        phone: validated.phone,

        // ✅ Base location coordinates (primary)
        localPostcode: validated.localPostcode,
        baseLat: validated.baseLat,
        baseLng: validated.baseLng,
        radiusMiles: validated.radiusMiles,

       

        // ✅ Vehicle type booleans (derived from vehicleType)
        hasWAV: isWAV,
        hasStandard: isStandard,
        wavOnly: isWAV, // If they selected WAV, assume WAV only

        // Vehicle amenities
        amenities: validated.amenities,

        approved: false, // default

        // Create AccessibilityProfile
        accessibilityProfile: {
          create: {
            // Accessibility & passenger-specific options
            wheelchairAccess: validated.wheelchairAccess,
            doubleWheelchairAccess: validated.doubleWheelchairAccess ?? false,
            highRoof: validated.highRoof ?? false,
            carerPresent: validated.carerPresent,
            passengerCount: validated.passengerCount,
            wheelchairUsers: validated.wheelchairUsers,
            nonWAVvehicle: validated.nonWAVvehicle,
            femaleDriverOnly: validated.femaleDriverOnly,
            quietEnvironment: validated.quietEnvironment,
            assistanceRequired: validated.assistanceRequired,
            noConversation: validated.noConversation,
            specificMusic: validated.specificMusic,
            electricScooterStorage: validated.electricScooterStorage,
            visualSchedule: validated.visualSchedule,
            assistanceAnimal: validated.assistanceAnimal,
            familiarDriverOnly: validated.familiarDriverOnly,
            ageOfPassenger: validated.ageOfPassenger ?? null,
            escortRequired: validated.escortRequired,
            preferredLanguage: validated.preferredLanguage ?? null,
            signLanguageRequired: validated.signLanguageRequired,
            textOnlyCommunication: validated.textOnlyCommunication,
            medicalConditions: validated.medicalConditions ?? null,
            medicationOnBoard: validated.medicationOnBoard,
            additionalNeeds: validated.additionalNeeds ?? null,

            // Safety & awareness
            seatTransferHelp: validated.seatTransferHelp,
            mobilityAidStorage: validated.mobilityAidStorage,
            noScents: validated.noScents,
            translationSupport: validated.translationSupport,
            firstAidTrained: validated.firstAidTrained,
            conditionAwareness: validated.conditionAwareness,
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
          },
        },
      },
    });

    return Response.json({ success: true, driver });
  } catch (err) {
    console.error("❌ Onboarding error:", err);
    return Response.json({ error: "Invalid input or server error." }, { status: 400 });
  }
}