// --- pages/api/onboarding/admin/route.js ---
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AdminOnboardingSchema } from "@/lib/validators";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = AdminOnboardingSchema.parse(body);
    console.log("Validated body:", validated);

    const existingBusiness = await prisma.business.findUnique({
      where: { adminUserId: adminUser.id },
    });

    let business;

    if (existingBusiness) {
      business = await prisma.business.update({
        where: { id: existingBusiness.id },
        data: {
          name: validated.businessName,
          type: validated.type,
          address1: validated.address1,
          city: validated.city,
          postcode: validated.postcode,
          website: validated.website,
          phone: validated.contactNumber,
          email: validated.contactEmail,
        },
      });
    } else {
      business = await prisma.business.create({
        data: {
          name: validated.businessName,
          type: validated.type,
          address1: validated.address1,
          city: validated.city,
          postcode: validated.postcode,
          website: validated.website,
          phone: validated.contactNumber,
          email: validated.contactEmail,
          adminUserId: adminUser.id,
        },
      });

      await prisma.user.update({
        where: { id: adminUser.id },
        data: { businessId: business.id },
      });
    }

    for (const coord of validated.coordinators) {
      const user = await prisma.user.upsert({
        where: { email: coord.email },
        update: {
          name: coord.name,
          phone: coord.phone,
          businessId: business.id,
        },
        create: {
          email: coord.email,
          name: coord.name,
          phone: coord.phone,
          role: "COORDINATOR",
          businessId: business.id,
        },
      });

      await prisma.businessMembership.upsert({
        where: {
          userId_businessId: {
            userId: user.id,
            businessId: business.id,
          },
        },
        update: { role: "COORDINATOR" },
        create: {
          userId: user.id,
          businessId: business.id,
          role: "COORDINATOR",
        },
      });
    }

    return NextResponse.json({ success: true, businessId: business.id });
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit form", message: error.message },
      { status: 500 }
    );
  }
}

