// app/api/onboarding/manager/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ManagerOnboardingSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { validateEmail, validateName, validatePostcodeUK, sanitizePlainText } from "@/lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = ManagerOnboardingSchema.parse(body);

    const { managerEmail, houses, area, name } = validated;

    // ===== SANITIZE MANAGER DATA =====
    
    // Validate and sanitize email
    const emailValidation = validateEmail(managerEmail);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }
    const sanitizedEmail = emailValidation.sanitized;

    // Validate and sanitize name
    const nameValidation = validateName(name, 'Manager name');
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }
    const sanitizedName = nameValidation.sanitized;

    // Sanitize area name
    const sanitizedArea = sanitizePlainText(area.trim()).substring(0, 100);
    if (sanitizedArea.length < 2) {
      return NextResponse.json({ error: "Area name must be at least 2 characters" }, { status: 400 });
    }

    // Get or create manager with sanitized data
    const managerUser = await prisma.user.upsert({
      where: { email: sanitizedEmail },
      update: { name: sanitizedName, role: "MANAGER" },
      create: {
        email: sanitizedEmail,
        name: sanitizedName,
        role: "MANAGER",
      },
    });

    // CREATE OR GET AREA (with sanitized name)
    const areaRecord = await prisma.area.upsert({
      where: { name: sanitizedArea },
      update: {},
      create: { name: sanitizedArea },
    });

    // Get coordinator from session
    const session = await getServerSession(authOptions);
    const coordinator = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { business: true },
    });

    if (!coordinator?.business) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 });
    }

    const businessId = coordinator.business.id;

    // Create BusinessMembership for the manager
    await prisma.businessMembership.upsert({
      where: {
        userId_businessId: {
          userId: managerUser.id,
          businessId: businessId,
        },
      },
      update: {
        role: "MANAGER",
      },
      create: {
        userId: managerUser.id,
        businessId: businessId,
        role: "MANAGER",
      },
    });

    // Create or reclaim houses (with sanitized data)
    for (const house of houses) {
      // ===== SANITIZE HOUSE DATA =====
      
      // Sanitize house label
      const sanitizedLabel = sanitizePlainText(house.label).substring(0, 200);
      if (sanitizedLabel.length < 2) {
        console.error(`❌ Invalid house label: ${house.label}`);
        continue; // Skip this house
      }

      // Sanitize address fields
      const sanitizedLine1 = sanitizePlainText(house.line1).substring(0, 200);
      const sanitizedCity = sanitizePlainText(house.city).substring(0, 100);
      
      // Validate and sanitize postcode
      const postcodeValidation = validatePostcodeUK(house.postcode);
      if (!postcodeValidation.valid) {
        console.error(`❌ Invalid postcode for house ${house.label}: ${house.postcode}`);
        continue;
      }
      const sanitizedPostcode = postcodeValidation.sanitized;

      // Sanitize notes (optional)
      let sanitizedNotes = null;
      if (house.notes) {
        sanitizedNotes = sanitizePlainText(house.notes).substring(0, 500);
      }

      // Validate coordinates
      const lat = parseFloat(house.lat);
      const lng = parseFloat(house.lng);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error(`❌ Invalid coordinates for house ${house.label}`);
        continue;
      }

      // Check if this address was previously deleted
      const deletedHouse = await prisma.house.findFirst({
        where: {
          postcode: sanitizedPostcode,
          line1: sanitizedLine1,
          deletedAt: { not: null },
        },
      });

      if (deletedHouse) {
        // RECLAIM: Restore and reassign to new business
        console.log(`🔄 Reclaiming house: ${sanitizedLabel} at ${sanitizedLine1}`);
        
        await prisma.house.update({
          where: { id: deletedHouse.id },
          data: {
            deletedAt: null,
            businessId: businessId,
            managerId: managerUser.id,
            areaId: areaRecord.id,
            label: sanitizedLabel,
            city: sanitizedCity,
            notes: sanitizedNotes,
            lat: lat,
            lng: lng,
          },
        });
      } else {
        // CREATE NEW house with sanitized data
        await prisma.house.create({
          data: {
            label: sanitizedLabel,
            line1: sanitizedLine1,
            city: sanitizedCity,
            postcode: sanitizedPostcode,
            notes: sanitizedNotes,
            lat: lat,
            lng: lng,
            internalId: `house-${Math.random().toString(36).slice(2, 8)}`,
            pin: Math.floor(1000 + Math.random() * 9000).toString(),
            loginName: `login-${Math.random().toString(36).slice(2, 6)}`,
            manager: { connect: { id: managerUser.id } },
            business: { connect: { id: businessId } },
            area: { connect: { id: areaRecord.id } },
          },
        });
      }
    }

    // Mark manager as onboarded
    await prisma.user.update({
      where: { id: managerUser.id },
      data: { 
        managerOnboarded: true,
        areaId: areaRecord.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manager onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit manager onboarding", message: error.message },
      { status: 500 }
    );
  }
}