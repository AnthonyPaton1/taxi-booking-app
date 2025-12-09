// app/api/onboarding/manager/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ManagerOnboardingSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { validateEmail, validateName, validatePostcodeUK, sanitizePlainText } from "@/lib/validation";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📥 Received onboarding data:", { ...body, houses: body.houses?.length });
    
    const validated = ManagerOnboardingSchema.parse(body);

    const { managerEmail, houses, name } = validated; // REMOVED: area

    // ===== SANITIZE MANAGER DATA =====
    
    const emailValidation = validateEmail(managerEmail);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }
    const sanitizedEmail = emailValidation.sanitized;

    const nameValidation = validateName(name, 'Manager name');
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }
    const sanitizedName = nameValidation.sanitized;

    // REMOVED: Area sanitization - we don't need it anymore

    const session = await getServerSession(authOptions);

    // Get the manager user (who should already exist from coordinator onboarding)
    const managerUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: { 
        business: true,
        area: true, // Include area for logging
      },
    });

    if (!managerUser) {
      return NextResponse.json({ error: "Manager not found. Please contact your coordinator." }, { status: 404 });
    }

    if (!managerUser.areaId) {
      return NextResponse.json({ error: "Manager must have an area assigned by coordinator" }, { status: 400 });
    }

    if (!managerUser.business) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 });
    }

    const businessId = managerUser.business.id;
    const areaId = managerUser.areaId; // Use manager's existing areaId

    console.log("✅ Manager found:", managerUser.id);
    console.log("✅ Business:", businessId);
    console.log("✅ Area:", managerUser.area?.name || areaId);

    const createdHouses = [];
    const housesWithErrors = [];

    // Create or reclaim houses
    for (let i = 0; i < houses.length; i++) {
      const house = houses[i];
      console.log(`\n🏠 Processing house ${i + 1}:`, house.label);
      
      try {
        // Sanitize house data
        const sanitizedLabel = sanitizePlainText(house.label).substring(0, 200);
        if (sanitizedLabel.length < 2) {
          console.error(`❌ Invalid house label: ${house.label}`);
          housesWithErrors.push({ label: house.label, error: "Invalid label" });
          continue;
        }

        const sanitizedLine1 = sanitizePlainText(house.line1).substring(0, 200);
        const sanitizedCity = sanitizePlainText(house.city).substring(0, 100);
        
        const postcodeValidation = validatePostcodeUK(house.postcode);
        if (!postcodeValidation.valid) {
          console.error(`❌ Invalid postcode for house ${house.label}: ${house.postcode}`);
          housesWithErrors.push({ label: house.label, error: "Invalid postcode" });
          continue;
        }
        const sanitizedPostcode = postcodeValidation.sanitized;

        let sanitizedNotes = null;
        if (house.notes) {
          sanitizedNotes = sanitizePlainText(house.notes).substring(0, 500);
        }

        // Validate and sanitize username
        const sanitizedUsername = sanitizePlainText(house.username).toLowerCase().substring(0, 20);
        if (!/^[a-z0-9-]+$/.test(sanitizedUsername) || sanitizedUsername.length < 6) {
          console.error(`❌ Invalid username for house ${house.label}: ${house.username}`);
          housesWithErrors.push({ label: house.label, error: "Invalid username format" });
          continue;
        }

        // Check username uniqueness
        const existingHouse = await prisma.house.findUnique({
          where: { loginName: sanitizedUsername },
        });

        if (existingHouse) {
          console.error(`❌ Username already exists: ${sanitizedUsername}`);
          housesWithErrors.push({ 
            label: house.label, 
            error: `Username "${sanitizedUsername}" is already taken` 
          });
          continue;
        }

        // Validate and hash password
        if (!house.password || house.password.length < 8) {
          console.error(`❌ Invalid password for house ${house.label}`);
          housesWithErrors.push({ label: house.label, error: "Password must be at least 8 characters" });
          continue;
        }

        // Validate password complexity
        const hasUpperCase = /[A-Z]/.test(house.password);
        const hasLowerCase = /[a-z]/.test(house.password);
        const hasNumber = /[0-9]/.test(house.password);
        const hasSpecialChar = /[!@#$%^&*]/.test(house.password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          console.error(`❌ Password doesn't meet complexity requirements for house ${house.label}`);
          housesWithErrors.push({ 
            label: house.label, 
            error: "Password must contain uppercase, lowercase, number, and special character" 
          });
          continue;
        }

        const hashedPassword = await bcrypt.hash(house.password, 10);
        console.log(`✅ Password hashed for ${house.label}`);

        // Validate coordinates
        const lat = parseFloat(house.lat);
        const lng = parseFloat(house.lng);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error(`❌ Invalid coordinates for house ${house.label}`);
          housesWithErrors.push({ label: house.label, error: "Invalid coordinates" });
          continue;
        }

        // Check if address was previously deleted
        const deletedHouse = await prisma.house.findFirst({
          where: {
            postcode: sanitizedPostcode,
            line1: sanitizedLine1,
            deletedAt: { not: null },
          },
        });

        if (deletedHouse) {
          // RECLAIM
          console.log(`🔄 Reclaiming house: ${sanitizedLabel}`);
          
          const updated = await prisma.house.update({
            where: { id: deletedHouse.id },
            data: {
              deletedAt: null,
              businessId: businessId,
              managerId: managerUser.id,
              areaId: areaId, // FIXED: Use manager's areaId
              label: sanitizedLabel,
              city: sanitizedCity,
              notes: sanitizedNotes,
              lat: lat,
              lng: lng,
              loginName: sanitizedUsername,
              password: hashedPassword,
            },
          });
          
          createdHouses.push({
            id: updated.id,
            label: updated.label,
            loginName: updated.loginName,
          });
          console.log(`✅ Reclaimed house: ${updated.id}`);
        } else {
          // CREATE NEW
          console.log(`🆕 Creating new house: ${sanitizedLabel}`);
          
          const created = await prisma.house.create({
            data: {
              label: sanitizedLabel,
              line1: sanitizedLine1,
              city: sanitizedCity,
              postcode: sanitizedPostcode,
              notes: sanitizedNotes,
              lat: lat,
              lng: lng,
              internalId: `house-${Math.random().toString(36).slice(2, 8)}`,
              password: hashedPassword,
              loginName: sanitizedUsername,
              manager: { connect: { id: managerUser.id } },
              business: { connect: { id: businessId } },
              area: { connect: { id: areaId } }, // FIXED: Use manager's areaId
            },
          });
          
          createdHouses.push({
            id: created.id,
            label: created.label,
            loginName: created.loginName,
          });
          console.log(`✅ Created house: ${created.id}`);
        }
      } catch (houseError) {
        console.error(`❌ Error processing house ${house.label}:`, houseError);
        housesWithErrors.push({ 
          label: house.label, 
          error: houseError.message 
        });
      }
    }

    console.log(`\n📊 Summary: ${createdHouses.length} houses created, ${housesWithErrors.length} errors`);

    // Mark manager as onboarded
    await prisma.user.update({
      where: { id: managerUser.id },
      data: { 
        managerOnboarded: true,
        // REMOVED: areaId update - manager already has it from coordinator
      },
    });
    console.log("✅ Manager marked as onboarded");

    return NextResponse.json({ 
      success: true,
      createdHouses,
      housesWithErrors: housesWithErrors.length > 0 ? housesWithErrors : undefined,
    });
    
  } catch (error) {
    console.error("❌ Manager onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit manager onboarding", message: error.message },
      { status: 500 }
    );
  }
}