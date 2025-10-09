import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CoordinatorOnboardingSchema } from "@/lib/validators";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = CoordinatorOnboardingSchema.parse(body);

    const { companyId, managers } = validated;

    for (const manager of managers) {
      await prisma.user.upsert({
        where: { email: manager.email },
        update: {
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
        },
        create: {
          email: manager.email,
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
        },
      });

      // ✅ Send invite (do this once per manager)
      await inviteUserToLogin({
        email: manager.email,
        name: manager.name,
        role: "MANAGER",
      });
      await prisma.user.update({
        where: {id: coordinatorUser.id},
        data: {hasOnboarded: true},
      })
    }

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