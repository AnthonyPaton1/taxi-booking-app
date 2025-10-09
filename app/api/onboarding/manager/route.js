import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { ManagerOnboardingSchema } from "@/lib/validators";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = ManagerOnboardingSchema.parse(body);

    const { houses, contactNumber, contactEmail, companyId } = validated;

    for (const house of houses) {
      // 1. Upsert the manager
      const user = await prisma.user.upsert({
        where: { email: house.managerEmail },
        update: {
          role: "MANAGER",
        },
        create: {
          email: house.managerEmail,
          role: "MANAGER",
        },
      });

      // 2. Create house
      await prisma.house.create({
        data: {
          label: house.label,
          line1: house.line1,
          city: house.city,
          postcode: house.postcode,
          notes: house.notes || null,
          internalId: house.internalId,
          pin: house.pin,
          loginName: house.loginName,
          manager: { connect: { id: user.id } },
          tenants: house.tenants,
          business: { connect: { id: companyId } }, // assuming it's a required relation
        },
      });
      await prisma.user.update({
        where: {id:managerUser.id},
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
