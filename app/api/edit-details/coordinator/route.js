import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Optional: define basic validation
const CoordinatorEditSchema = z.object({
  phone: z.string().min(8),
  area: z.string().optional(), // comma-separated string from frontend
  name: z.string(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    area: user.area?.join(", ") || "", // Return as comma-separated for frontend
  });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CoordinatorEditSchema.parse(body);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: validated.name,
        phone: validated.phone,
        area: validated.area
          ? validated.area.split(",").map((a) => a.trim().toUpperCase())
          : [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Coordinator PUT error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}