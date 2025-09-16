import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OnboardingSchema } from "@/lib/validators";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: { company: true },
      },
    },
  });

  const company = user?.memberships?.[0]?.company;
  const coordinators = await prisma.userCompany.findMany({
    where: { companyId: company.id, role: "COORDINATOR" },
    include: { user: true },
  });
  console.log("Company GET:", company.id);
  return NextResponse.json({
    companyId: company.id, // ✅ send this to the frontend
    businessName: company.name,
    contactNumber: company.phone,
    contactEmail: user.email,
    addressLine1: company.addressLine1 ?? "",
    city: company.city ?? "",
    postcode: company.postcode ?? "",
    website: company.website ?? "",
    coordinators: coordinators.map((c) => ({
      name: c.user.name,
      email: c.user.email,
      phone: c.user.phone,
      areas: c.user.areas?.join(", "),
    })),
  });
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const validated = OnboardingSchema.parse(body);

    const companyId = body.companyId; // Make sure this is being sent from the form

    function normalizeWebsite(url) {
      if (!url) return "";
      if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
      }
      return url;
    }

    await prisma.company.update({
      where: { id: companyId },
      data: {
        name: validated.businessName,
        addressLine1: validated.addressLine1,
        city: validated.city,
        postcode: validated.postcode,
        website: normalizeWebsite(validated.website),
        phone: validated.contactNumber,
        email: validated.contactEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
