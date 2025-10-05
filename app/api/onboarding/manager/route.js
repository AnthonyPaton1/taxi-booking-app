import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { ManagerOnboardingSchema } from "@/lib/validators";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = ManagerOnboardingSchema.parse(body);

    const { managers, contactNumber, contactEmail } = validated;

    for (const manager of managers) {
      // 1. Upsert the manager user
      const user = await prisma.user.upsert({
        where: { email: manager.email },
        update: {
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
        },
        create: {
          email: manager.email,
          name: manager.name,
          phone: manager.phone,
          role: "MANAGER",
        },
      });

      // 2. Optional: link to a company if needed (based on your system)

      // 3. Create houses linked to manager
      for (const house of manager.houses) {
        await prisma.house.create({
          data: {
            label: house.label,
            line1: house.line1,
            city: house.city,
            postcode: house.postcode,
            contactNumber: house.contactNumber,
            manager: { connect: { id: user.id } },
          },
        });
      }
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
