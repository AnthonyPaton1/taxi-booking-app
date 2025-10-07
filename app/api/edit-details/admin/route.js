import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminOnboardingSchema } from "@/lib/validators";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: { business: true },
      },
    },
  });

  const business = user?.memberships?.[0]?.business;
  const coordinators = await prisma.userBusiness.findMany({
    where: { businessId: business.id, role: "COORDINATOR" },
    include: { user: true },
  });
  
  return NextResponse.json({
    businessId: business.id, // ✅ send this to the frontend
    businessName: business.name,
    contactNumber: business.phone,
    contactEmail: user.email,
    address1: business.address1 ?? "",
    city: business.city ?? "",
    postcode: business.postcode ?? "",
    website: business.website ?? "",
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
    const validated = AdminOnboardingSchema.parse(body);

    const businessId = body.businessId; // Make sure this is being sent from the form

    function normalizeWebsite(url) {
      if (!url) return "";
      if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
      }
      return url;
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        name: validated.businessName,
        address1: validated.address1,
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
