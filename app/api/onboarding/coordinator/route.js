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

    for (const manager of managers) {
      //  CREATE OR GET THE AREA RECORD
      let areaRecord = null;
      if (manager.area && manager.area.trim()) {
        areaRecord = await prisma.area.upsert({
          where: { name: manager.area.trim() },
          update: {},
          create: { name: manager.area.trim() },
        });
      }

      await prisma.user.upsert({
        where: { email: manager.email },
        update: {
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
          //  Link manager to their area
          areaId: areaRecord?.id,
        },
        create: {
          email: manager.email,
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
          //  Link manager to their area
          areaId: areaRecord?.id,
        },
      });

      await inviteUserToLogin({
        email: manager.email,
        name: manager.name,
        role: "MANAGER",
      });
    }
    
    await prisma.user.update({
      where: {id: coordinatorUser.id},
      data: {coordinatorOnboarded: true},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manager onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit manager onboarding" },
      { status: 500 }
    );
  }
}