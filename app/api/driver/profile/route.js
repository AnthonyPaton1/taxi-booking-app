// app/api/driver/profile/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      // Personal
      name,
      email,
      phone,
      // Vehicle
      vehicleType,
      vehicleReg,
      // Location
      localPostcode,
      radiusMiles,
      // Compliance
      dbsChecked,
      licenceNumber,
      localAuthorityRegistered,
      publicLiabilityInsurance,
      fullyCompInsurance,
      healthCheckPassed,
      englishProficiency,
      ukDrivingLicence,
      // Accessibility
      wheelchairAccess,
      doubleWheelchairAccess,
      highRoof,
      seatTransferHelp,
      mobilityAidStorage,
      electricScooterStorage,
      passengerCount,
      wheelchairUsers,
      quietEnvironment,
      noConversation,
      noScents,
      specificMusic,
      visualSchedule,
      signLanguageRequired,
      textOnlyCommunication,
      preferredLanguage,
      translationSupport,
      assistanceRequired,
      assistanceAnimal,
      familiarDriverOnly,
      femaleDriverOnly,
      nonWAVvehicle,
      medicationOnBoard,
      medicalConditions,
      firstAidTrained,
      conditionAwareness,
      additionalNeeds,
    } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (!vehicleType || !vehicleReg) {
      return NextResponse.json(
        { success: false, error: "Vehicle type and registration are required" },
        { status: 400 }
      );
    }

    if (!localPostcode || !radiusMiles) {
      return NextResponse.json(
        { success: false, error: "Postcode and service radius are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        driver: {
          include: {
            accessibilityProfile: true,
            compliance: true,
          },
        },
      },
    });

    if (!user || !user.driver) {
      return NextResponse.json(
        { success: false, error: "Driver profile not found" },
        { status: 404 }
      );
    }

    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
    });

    // Update driver
    await prisma.driver.update({
      where: { id: user.driver.id },
      data: {
        phone: phone.trim(),
        vehicleType: vehicleType.trim(),
        vehicleReg: vehicleReg.trim().toUpperCase(),
        localPostcode: localPostcode.trim().toUpperCase(),
        radiusMiles: parseInt(radiusMiles),
      },
    });

    // Update accessibility profile
    await prisma.accessibilityProfile.update({
      where: { id: user.driver.accessibilityProfileId },
      data: {
        // Mobility
        wheelchairAccess: wheelchairAccess || false,
        doubleWheelchairAccess: doubleWheelchairAccess || false,
        highRoof: highRoof || false,
        seatTransferHelp: seatTransferHelp || false,
        mobilityAidStorage: mobilityAidStorage || false,
        electricScooterStorage: electricScooterStorage || false,
        
        // Capacity
        passengerCount: parseInt(passengerCount) || 4,
        wheelchairUsers: parseInt(wheelchairUsers) || 0,
        
        // Sensory
        quietEnvironment: quietEnvironment || false,
        noConversation: noConversation || false,
        noScents: noScents || false,
        specificMusic: specificMusic?.trim() || null,
        visualSchedule: visualSchedule || false,
        
        // Communication
        signLanguageRequired: signLanguageRequired || false,
        textOnlyCommunication: textOnlyCommunication || false,
        preferredLanguage: preferredLanguage?.trim() || null,
        translationSupport: translationSupport || false,
        
        // Special Requirements
        assistanceRequired: assistanceRequired || false,
        assistanceAnimal: assistanceAnimal || false,
        familiarDriverOnly: familiarDriverOnly || false,
        femaleDriverOnly: femaleDriverOnly || false,
        nonWAVvehicle: nonWAVvehicle || false,
        
        // Health & Safety
        medicationOnBoard: medicationOnBoard || false,
        medicalConditions: medicalConditions?.trim() || null,
        firstAidTrained: firstAidTrained || false,
        conditionAwareness: conditionAwareness || false,
        
        // Additional
        additionalNeeds: additionalNeeds?.trim() || null,
      },
    });

    // Update or create compliance record
    if (user.driver.compliance) {
      await prisma.driverCompliance.update({
        where: { id: user.driver.compliance.id },
        data: {
          ukDrivingLicence: ukDrivingLicence || false,
          licenceNumber: licenceNumber?.trim() || "",
          localAuthorityRegistered: localAuthorityRegistered || false,
          dbsChecked: dbsChecked || false,
          publicLiabilityInsurance: publicLiabilityInsurance || false,
          fullyCompInsurance: fullyCompInsurance || false,
          healthCheckPassed: healthCheckPassed || false,
          englishProficiency: englishProficiency || false,
        },
      });
    } else {
      // Create if doesn't exist
      await prisma.driverCompliance.create({
        data: {
          driverId: user.driver.id,
          ukDrivingLicence: ukDrivingLicence || false,
          licenceNumber: licenceNumber?.trim() || "",
          localAuthorityRegistered: localAuthorityRegistered || false,
          dbsChecked: dbsChecked || false,
          publicLiabilityInsurance: publicLiabilityInsurance || false,
          fullyCompInsurance: fullyCompInsurance || false,
          healthCheckPassed: healthCheckPassed || false,
          englishProficiency: englishProficiency || false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}