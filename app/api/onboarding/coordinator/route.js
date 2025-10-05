import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CoordinatorOnboardingSchema } from "@/lib/validators";

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
          businessId: companyId, // ✅ assign businessId directly
        },
        create: {
          email: manager.email,
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
          businessId: companyId,
        },
      });
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