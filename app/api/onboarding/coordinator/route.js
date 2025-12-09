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
    
    // Get coordinator with their area
    const coordinatorUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        area: true, // Include area to show in logs
      },
    });

    if (!coordinatorUser?.areaId) {
      return NextResponse.json(
        { error: "Coordinator must have an area assigned" },
        { status: 400 }
      );
    }

    const { companyId, managers } = validated;
    
    console.log(`📋 Processing ${managers.length} managers for area: ${coordinatorUser.area?.name || coordinatorUser.areaId}`);
    
    const emailResults = [];

    for (const manager of managers) {
      console.log(`\n🔄 Processing manager: ${manager.email}`);
      
      // ===== INPUT SANITIZATION & VALIDATION =====
      
      const emailValidation = validateEmail(manager.email);
      if (!emailValidation.valid) {
        console.error(`  ❌ Invalid email: ${manager.email}`);
        emailResults.push({
          email: manager.email,
          success: false,
          error: emailValidation.error
        });
        continue;
      }
      const sanitizedEmail = emailValidation.sanitized;

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

      // REMOVED: Area validation and creation
      // Manager inherits coordinator's area - no need to process manager.area

      // Create/update user with coordinator's areaId
      const user = await prisma.user.upsert({
        where: { email: sanitizedEmail },
        update: {
          name: sanitizedName,
          phone: sanitizedPhone,
          role: "MANAGER",
          businessId: companyId,
          areaId: coordinatorUser.areaId, // CHANGED: Use coordinator's area
        },
        create: {
          email: sanitizedEmail,
          name: sanitizedName,
          phone: sanitizedPhone,
          role: "MANAGER",
          businessId: companyId,
          areaId: coordinatorUser.areaId, // CHANGED: Use coordinator's area
        },
      });
      
      console.log(`  ✅ Manager created/updated with areaId: ${coordinatorUser.areaId}`);

      // Send invitation email
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
      emailResults
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