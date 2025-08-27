// app/api/onboarding/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OnboardingSchema } from "@/lib/validators";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = OnboardingSchema.parse(body);

    // Create the company
    const company = await prisma.company.create({
      data: {
        name: validated.businessName,
        phone: validated.contactNumber,
      },
    });

    // Create coordinator user
    const user = await prisma.user.upsert({
      where: { email: validated.coordinatorEmail },
      update: {
        name: validated.coordinatorName,
        phone: validated.coordinatorPhone,
      },
      create: {
        email: validated.coordinatorEmail,
        name: validated.coordinatorName,
        phone: validated.coordinatorPhone,
        role: "COORDINATOR",
      },
    });

    // Link coordinator to company
    await prisma.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: "COORDINATOR",
      },
    });

    // Optional: Store address/areas for future use
    // (Add `headOfficeLine1`, `city`, etc., to Company model if needed)

    // Placeholder for email notification (future SMTP integration)
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
