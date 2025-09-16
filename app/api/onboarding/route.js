import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OnboardingSchema } from "@/lib/validators";
import { z } from "zod";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = OnboardingSchema.parse(body);

    // Create the company
    const company = await prisma.company.create({
      data: {
        name: validated.businessName,
        addressLine1: validated.addressLine1,
        city: validated.city,
        postcode: validated.postcode,
        website: validated.website,
        phone: validated.contactNumber,
        email: validated.contactEmail,
      },
    });

    // Create each coordinator and link to company
    for (const coord of validated.coordinators) {
      const user = await prisma.user.upsert({
        where: { email: coord.email },
        update: {
          name: coord.name,
          phone: coord.phone,
        },
        create: {
          email: coord.email,
          name: coord.name,
          phone: coord.phone,
          role: "COORDINATOR",
        },
      });

      await prisma.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: "COORDINATOR",
        },
      });
    }

    console.log("New onboarding submission:", validated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
