// app/api/house/incident/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import DOMPurify from "isomorphic-dompurify";
import { rateLimit } from "@/lib/rateLimit"; 

export async function POST(request) {
  try {
    // 1. Verify house session
    const session = await getHouseSession(request);
    if (!session?.houseId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting (max 5 incidents per hour per house)
    const rateLimitResult = await rateLimit(session.houseId, 5, 3600);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Get and sanitize input
    const body = await request.json();
    
    const sanitized = {
      title: DOMPurify.sanitize(body.title?.trim() || "").substring(0, 200),
      description: DOMPurify.sanitize(body.description?.trim() || "").substring(0, 2000),
      residentId: body.residentId, // Validate this exists and belongs to house
      severity: ["low", "medium", "high"].includes(body.severity) ? body.severity : "medium",
    };

    // 4. Verify resident belongs to this house
    const resident = await prisma.resident.findFirst({
      where: {
        id: sanitized.residentId,
        houseId: session.houseId,
      },
    });

    if (!resident) {
      return NextResponse.json(
        { error: "Invalid resident" },
        { status: 400 }
      );
    }

    // 5. Create incident (with house context)
    const incident = await prisma.incident.create({
      data: {
        ...sanitized,
        houseId: session.houseId,
        reportedBy: "house-staff",
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, incident });

  } catch (error) {
    console.error("Incident submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit incident" },
      { status: 500 }
    );
  }
}