// app/api/onboarding/driver/route.js
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DriverOnboardingSchema } from "@/lib/validators";
import { validateName, validatePhoneUK, validatePostcodeUK, sanitizePlainText } from "@/lib/validation";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const validated = DriverOnboardingSchema.parse(body);

    // ===== SANITIZE DRIVER DATA =====
    
    // Validate and sanitize name
    const nameValidation = validateName(validated.name, 'Driver name');
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400 });
    }
    const sanitizedName = nameValidation.sanitized;

    // Validate and sanitize phone
    const phoneValidation = validatePhoneUK(validated.phone);
    if (!phoneValidation.valid) {
      return Response.json({ error: phoneValidation.error }, { status: 400 });
    }
    const sanitizedPhone = phoneValidation.sanitized;

    // Sanitize vehicle registration (UK format: AA00 AAA or similar)
    const sanitizedVehicleReg = sanitizePlainText(validated.vehicleReg).toUpperCase().substring(0, 10);
    if (sanitizedVehicleReg.length < 5) {
      return Response.json({ error: "Invalid vehicle registration" }, { status: 400 });
    }

    // Validate and sanitize postcode
    const postcodeValidation = validatePostcodeUK(validated.localPostcode);
    if (!postcodeValidation.valid) {
      return Response.json({ error: postcodeValidation.error }, { status: 400 });
    }
    const sanitizedPostcode = postcodeValidation.sanitized;

    // Validate coordinates
    const baseLat = parseFloat(validated.baseLat);
    const baseLng = parseFloat(validated.baseLng);
    if (isNaN(baseLat) || isNaN(baseLng) || baseLat < -90 || baseLat > 90 || baseLng < -180 || baseLng > 180) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Validate radius
    const radiusMiles = parseFloat(validated.radiusMiles);
    if (isNaN(radiusMiles) || radiusMiles < 1 || radiusMiles > 100) {
      return Response.json({ error: "Service radius must be between 1 and 100 miles" }, { status: 400 });
    }

    // Validate vehicle type
    const validVehicleTypes = ['WAV', 'CAR', 'MINIBUS'];
    if (!validVehicleTypes.includes(validated.vehicleType)) {
      return Response.json({ error: "Invalid vehicle type" }, { status: 400 });
    }

    // Sanitize optional text fields
    const sanitizedSpecificMusic = validated.specificMusic 
      ? sanitizePlainText(validated.specificMusic).substring(0, 200) 
      : null;
    
    const sanitizedPreferredLanguage = validated.preferredLanguage 
      ? sanitizePlainText(validated.preferredLanguage).substring(0, 50) 
      : null;
    
    const sanitizedMedicalConditions = validated.medicalConditions 
      ? sanitizePlainText(validated.medicalConditions).substring(0, 500) 
      : null;
    
    const sanitizedAdditionalNeeds = validated.additionalNeeds 
      ? sanitizePlainText(validated.additionalNeeds).substring(0, 500) 
      : null;

    // Validate passenger counts
    const passengerCount = parseInt(validated.passengerCount);
    const wheelchairUsers = parseInt(validated.wheelchairUsers);
    
    if (isNaN(passengerCount) || passengerCount < 1 || passengerCount > 8) {
      return Response.json({ error: "Passenger count must be between 1 and 8" }, { status: 400 });
    }
    
    if (isNaN(wheelchairUsers) || wheelchairUsers < 0 || wheelchairUsers > 4) {
      return Response.json({ error: "Wheelchair users must be between 0 and 4" }, { status: 400 });
    }

    // Derive boolean flags from vehicleType
    const isWAV = validated.vehicleType === "WAV";
    const isStandard = validated.vehicleType === "CAR";
    const isMinibus = validated.vehicleType === "MINIBUS";

    // Create the driver with sanitized data
    const driver = await prisma.driver.create({
      data: {
        userId: session.user.id,
        name: sanitizedName,
        vehicleType: validated.vehicleType,
        vehicleReg: sanitizedVehicleReg,
        phone: sanitizedPhone,

        // Base location coordinates (sanitized)
        localPostcode: sanitizedPostcode,
        baseLat: baseLat,
        baseLng: baseLng,
        radiusMiles: radiusMiles,

        // Service area coordinates
        serviceAreaLat: baseLat,
        serviceAreaLng: baseLng,
        serviceAreaRadius: radiusMiles,

        // Vehicle type booleans
        hasWAV: isWAV,
        hasStandard: isStandard,
        wavOnly: isWAV,

        // Vehicle amenities
        amenities: validated.amenities,

        approved: false,

        // Create AccessibilityProfile with sanitized data
        accessibilityProfile: {
          create: {
            // Accessibility & passenger-specific options
            wheelchairAccess: Boolean(validated.wheelchairAccess),
            doubleWheelchairAccess: Boolean(validated.doubleWheelchairAccess ?? false),
            highRoof: Boolean(validated.highRoof ?? false),
            carerPresent: Boolean(validated.carerPresent),
            passengerCount: passengerCount,
            wheelchairUsers: wheelchairUsers,
            nonWAVvehicle: Boolean(validated.nonWAVvehicle),
            femaleDriverOnly: Boolean(validated.femaleDriverOnly),
            quietEnvironment: Boolean(validated.quietEnvironment),
            assistanceRequired: Boolean(validated.assistanceRequired),
            noConversation: Boolean(validated.noConversation),
            specificMusic: sanitizedSpecificMusic,
            electricScooterStorage: Boolean(validated.electricScooterStorage),
            visualSchedule: Boolean(validated.visualSchedule),
            assistanceAnimal: Boolean(validated.assistanceAnimal),
            familiarDriverOnly: Boolean(validated.familiarDriverOnly),
            ageOfPassenger: validated.ageOfPassenger ?? null,
            escortRequired: Boolean(validated.escortRequired),
            preferredLanguage: sanitizedPreferredLanguage,
            signLanguageRequired: Boolean(validated.signLanguageRequired),
            textOnlyCommunication: Boolean(validated.textOnlyCommunication),
            medicalConditions: sanitizedMedicalConditions,
            medicationOnBoard: Boolean(validated.medicationOnBoard),
            additionalNeeds: sanitizedAdditionalNeeds,

            // Safety & awareness
            seatTransferHelp: Boolean(validated.seatTransferHelp),
            mobilityAidStorage: Boolean(validated.mobilityAidStorage),
            noScents: Boolean(validated.noScents),
            translationSupport: Boolean(validated.translationSupport),
            firstAidTrained: Boolean(validated.firstAidTrained),
            conditionAwareness: Boolean(validated.conditionAwareness),
          },
        },

        // Create DriverCompliance
        compliance: {
          create: {
            ukDrivingLicence: Boolean(validated.ukDrivingLicence),
            localAuthorityRegistered: Boolean(validated.localAuthorityRegistered),
            dbsChecked: Boolean(validated.dbsChecked),
            publicLiabilityInsurance: Boolean(validated.publicLiabilityInsurance),
            fullyCompInsurance: Boolean(validated.fullyCompInsurance),
            healthCheckPassed: Boolean(validated.healthCheckPassed),
            englishProficiency: Boolean(validated.englishProficiency),
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