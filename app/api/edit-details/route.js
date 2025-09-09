import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OnboardingSchema } from "@/lib/validators";

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

  return NextResponse.json({
    businessName: company.name,
    contactNumber: company.phone,
    contactEmail: user.email,
    // etc...
    coordinators: coordinators.map((c) => ({
      name: c.user.name,
      email: c.user.email,
      phone: c.user.phone,
      areas: c.user.areas?.join(", "), // if storing areas separately
    })),
  });
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validated = OnboardingSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: true },
    });

    const companyId = user?.memberships?.[0]?.companyId;

    // Update company
    await prisma.company.update({
      where: { id: companyId },
      data: {
        name: validated.businessName,
        phone: validated.contactNumber,
      },
    });

    // Optional: Clear + recreate coordinator links, or update individually
    for (const coord of validated.coordinators) {
      await prisma.user.upsert({
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
      // ... and link to company if needed
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
