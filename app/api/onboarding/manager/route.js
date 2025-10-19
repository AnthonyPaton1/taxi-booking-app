import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ManagerOnboardingSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = ManagerOnboardingSchema.parse(body);

    const { managerEmail, houses, area, name } = validated;

    // Get or create manager
    const managerUser = await prisma.user.upsert({
      where: { email: managerEmail },
      update: { name, role: "MANAGER" },
      create: {
        email: managerEmail,
        name,
        role: "MANAGER",
      },
    });

    // ✅ CREATE OR GET AREA (fallback if not created upstream)
    const areaRecord = await prisma.area.upsert({
      where: { name: area.trim() },
      update: {},
      create: { name: area.trim() },
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

    // Create houses
    for (const house of houses) {
      await prisma.house.create({
        data: {
          label: `${house.number} ${house.street}`,
          line1: `${house.number} ${house.street}`,
          city: house.city || area,
          postcode: house.postcode,
          tenants: house.tenants,
          internalId: `house-${Math.random().toString(36).slice(2, 8)}`,
          pin: Math.floor(1000 + Math.random() * 9000).toString(),
          loginName: `login-${Math.random().toString(36).slice(2, 6)}`,
          manager: { connect: { id: managerUser.id } },
          business: { connect: { id: businessId } },
          area: { connect: { id: areaRecord.id } },
        },
      });
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
