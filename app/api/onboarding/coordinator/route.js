// app/api/onboarding/coordinator/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CoordinatorOnboardingSchema } from "@/lib/validators";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
      
      // CREATE OR GET THE AREA RECORD
      let areaRecord = null;
      if (manager.area && manager.area.trim()) {
        areaRecord = await prisma.area.upsert({
          where: { name: manager.area.trim() },
          update: {},
          create: { name: manager.area.trim() },
        });
        console.log(`  ✅ Area created/found: ${manager.area}`);
      }

      const user = await prisma.user.upsert({
        where: { email: manager.email },
        update: {
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
          areaId: areaRecord?.id,
        },
        create: {
          email: manager.email,
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
          areaId: areaRecord?.id,
        },
      });
      console.log(`  ✅ User created/updated: ${user.id}`);

      // Send invitation email
      console.log(`  📧 Sending email to: ${manager.email}`);
      const emailResult = await inviteUserToLogin({
        email: manager.email,
        name: manager.name,
        role: "MANAGER",
      });
      
      emailResults.push({
        email: manager.email,
        ...emailResult
      });
      
      if (emailResult.success) {
        console.log(`  ✅ Email sent successfully to ${manager.email}`);
      } else {
        console.error(`  ❌ Email failed for ${manager.email}:`, emailResult.error);
      }
      
      // Add small delay between emails (optional, helps with rate limiting)
      if (managers.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      
    }
    
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