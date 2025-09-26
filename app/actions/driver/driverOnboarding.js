"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function completeDriverOnboarding(formData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const userId = session.user.id;

  return await prisma.$transaction(async (tx) => {
    // Check if driver already exists
    const existingDriver = await tx.driver.findUnique({
      where: { userId },
    });

    let driver;
    if (existingDriver) {
      // Update existing record
      driver = await tx.driver.update({
        where: { userId },
        data: {
          name: formData.name,
          licenceNumber: formData.licenceNumber,
          vehicleType: formData.vehicleType,
          vehicleReg: formData.vehicleReg,
          localPostcode: formData.localPostcode,
          radiusMiles: formData.radiusMiles,
          phone: formData.phone,

          // Compliance
          ukDrivingLicence: formData.ukDrivingLicence || false,
          localAuthorityRegistered: formData.localAuthorityRegistered || false,
          dbsChecked: formData.dbsChecked || false,
          publicLiabilityInsurance: formData.publicLiabilityInsurance || false,
          fullyCompInsurance: formData.fullyCompInsurance || false,
          healthCheckPassed: formData.healthCheckPassed || false,
          englishProficiency: formData.englishProficiency || false,

          // Vehicle amenities
          amenities: formData.amenities || [],
        },
      });
    } else {
      // Create fresh record
      driver = await tx.driver.create({
        data: {
          userId,
          name: formData.name,
          licenceNumber: formData.licenceNumber,
          vehicleType: formData.vehicleType,
          vehicleReg: formData.vehicleReg,
          localPostcode: formData.localPostcode,
          radiusMiles: formData.radiusMiles,
          phone: formData.phone,

          // Compliance
          ukDrivingLicence: formData.ukDrivingLicence || false,
          localAuthorityRegistered: formData.localAuthorityRegistered || false,
          dbsChecked: formData.dbsChecked || false,
          publicLiabilityInsurance: formData.publicLiabilityInsurance || false,
          fullyCompInsurance: formData.fullyCompInsurance || false,
          healthCheckPassed: formData.healthCheckPassed || false,
          englishProficiency: formData.englishProficiency || false,

          // Vehicle amenities
          amenities: formData.amenities || [],
        },
      });
    }

    // Mark user onboarding complete
    await tx.user.update({
      where: { id: userId },
      data: { driverOnboarded: true },
    });

    return driver;
  });
}