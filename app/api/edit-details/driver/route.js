// app/api/driver/edit/route.js
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user with driver and all relations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        driver: {
          include: {
            accessibilityProfile: true,
            compliance: true,
          },
        },
      },
    });

    if (!user?.driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // Return structured data
    return NextResponse.json({
      driver: {
        id: user.driver.id,
        name: user.driver.name,
        vehicleType: user.driver.vehicleType,
        vehicleReg: user.driver.vehicleReg,
        amenities: user.driver.amenities,
        localPostcode: user.driver.localPostcode,
        radiusMiles: user.driver.radiusMiles,
        phone: user.driver.phone,
        approved: user.driver.approved,
      },
      accessibilityProfile: user.driver.accessibilityProfile,
      compliance: user.driver.compliance,
    });
  } catch (error) {
    console.error("❌ Error fetching driver details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Note: PUT is now handled by the updateDriverDetails server action
// But keeping this here in case you want API route approach instead
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Get user's driver
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { driver: true },
    });

    if (!user?.driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update Driver
      await tx.driver.update({
        where: { id: user.driver.id },
        data: {
          name: data.name,
          vehicleType: data.vehicleType,
          vehicleReg: data.vehicleReg,
          amenities: data.amenities || [],
          localPostcode: data.localPostcode,
          radiusMiles: data.radiusMiles,
          phone: data.phone,
        },
      });

      // Update AccessibilityProfile
      await tx.accessibilityProfile.update({
        where: { id: user.driver.accessibilityProfileId },
        data: {
          wheelchairAccess: data.wheelchairAccess,
          // ... all other accessibility fields
        },
      });

      // Update DriverCompliance
      await tx.driverCompliance.update({
        where: { driverId: user.driver.id },
        data: {
          ukDrivingLicence: data.ukDrivingLicence,
          licenceNumber: data.licenceNumber,
          // ... all other compliance fields
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating driver:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}