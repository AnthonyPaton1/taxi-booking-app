// app/api/onboarding/coordinator/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CoordinatorOnboardingSchema } from "@/lib/validators";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateEmail, validateName, validatePhoneUK, sanitizePlainText } from "@/lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = CoordinatorOnboardingSchema.parse(body);
    const session = await getServerSession(authOptions);
    const coordinatorUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const { companyId, managers } = validated;
    
    console.log(`📋 Processing ${managers.length} managers...`);
    
    // Track email results
    const emailResults = [];

    for (const manager of managers) {
      console.log(`\n🔄 Processing manager: ${manager.email}`);
      
      // ===== INPUT SANITIZATION & VALIDATION =====
      
      // Validate and sanitize email
      const emailValidation = validateEmail(manager.email);
      if (!emailValidation.valid) {
        console.error(`  ❌ Invalid email: ${manager.email}`);
        emailResults.push({
          email: manager.email,
          success: false,
          error: emailValidation.error
        });
        continue; // Skip this manager
      }
      const sanitizedEmail = emailValidation.sanitized;

      // Validate and sanitize name
      const nameValidation = validateName(manager.name);
      if (!nameValidation.valid) {
        console.error(`  ❌ Invalid name: ${manager.name}`);
        emailResults.push({
          email: sanitizedEmail,
          success: false,
          error: nameValidation.error
        });
        continue;
      }
      const sanitizedName = nameValidation.sanitized;

      // Validate and sanitize phone
      let sanitizedPhone = null;
      if (manager.phone) {
        const phoneValidation = validatePhoneUK(manager.phone);
        if (!phoneValidation.valid) {
          console.error(`  ❌ Invalid phone: ${manager.phone}`);
          emailResults.push({
            email: sanitizedEmail,
            success: false,
            error: phoneValidation.error
          });
          continue;
        }
        sanitizedPhone = phoneValidation.sanitized;
      }

      // Sanitize area name
      let sanitizedArea = null;
      if (manager.area && manager.area.trim()) {
        sanitizedArea = sanitizePlainText(manager.area.trim()).substring(0, 100);
        
        if (sanitizedArea.length < 2) {
          console.error(`  ❌ Invalid area name: ${manager.area}`);
          emailResults.push({
            email: sanitizedEmail,
            success: false,
            error: 'Area name must be at least 2 characters'
          });
          continue;
        }
      }

      // CREATE OR GET THE AREA RECORD (using sanitized area)
      let areaRecord = null;
      if (sanitizedArea) {
        areaRecord = await prisma.area.upsert({
          where: { name: sanitizedArea },
          update: {},
          create: { name: sanitizedArea },
        });
        
      }

      // Create/update user with sanitized data
      const user = await prisma.user.upsert({
        where: { email: sanitizedEmail },
        update: {
          name: sanitizedName,
          phone: sanitizedPhone,
          role: "MANAGER",
          businessId: companyId,
          areaId: areaRecord?.id,
        },
        create: {
          email: sanitizedEmail,
          name: sanitizedName,
          phone: sanitizedPhone,
          role: "MANAGER",
          businessId: companyId,
          areaId: areaRecord?.id,
        },
      });
      

      // Send invitation email (using sanitized data)
     
      const emailResult = await inviteUserToLogin({
        email: sanitizedEmail,
        name: sanitizedName,
        role: "MANAGER",
      });
      
      emailResults.push({
        email: sanitizedEmail,
        ...emailResult
      });
      
      if (emailResult.success) {
        console.log(`  ✅ Email sent successfully to ${sanitizedEmail}`);
      } else {
        console.error(`  ❌ Email failed for ${sanitizedEmail}:`, emailResult.error);
      }
      
      // Add small delay between emails (optional, helps with rate limiting)
      if (managers.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Mark coordinator as onboarded
    await prisma.user.update({
      where: { id: coordinatorUser.id },
      data: { coordinatorOnboarded: true },
    });
    
    console.log('\n📊 Email Results Summary:');
    emailResults.forEach(result => {
      console.log(`  ${result.success ? '✅' : '❌'} ${result.email}: ${result.success ? 'Sent' : result.error}`);
    });

    return NextResponse.json({ 
      success: true,
      emailResults // Return email results to frontend for debugging
    });
    
  } catch (error) {
    console.error("❌ Manager onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit manager onboarding", details: error.message },
      { status: 500 }
    );
  }
}