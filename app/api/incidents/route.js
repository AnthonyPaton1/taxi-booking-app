// app/api/incidents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { validateTextArea, sanitizePlainText } from "@/lib/validation";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Only drivers and managers can submit incidents
    if (
      !session ||
      !["DRIVER", "MANAGER"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      incidentType,
      description,
      time,
      actionsTaken,
      followUp,
      emergency,
      witnesses,
      image,
      houseId,
    } = body;

    // ===== INPUT SANITIZATION & VALIDATION =====
    
    // Validate and sanitize description
    const descriptionValidation = validateTextArea(description, 10, 2000);
    if (!descriptionValidation.valid) {
      return NextResponse.json(
        { success: false, error: descriptionValidation.error },
        { status: 400 }
      );
    }
    const sanitizedDescription = descriptionValidation.sanitized;

    // Validate time
    if (!time) {
      return NextResponse.json(
        { success: false, error: "Time is required" },
        { status: 400 }
      );
    }

    // Validate incident type if it's an incident
    if (type === "INCIDENT" && !incidentType) {
      return NextResponse.json(
        { success: false, error: "Incident type is required for incidents" },
        { status: 400 }
      );
    }

    // Sanitize actionsTaken (optional)
    let sanitizedActionsTaken = null;
    if (actionsTaken) {
      const actionsValidation = validateTextArea(actionsTaken, 0, 1000);
      sanitizedActionsTaken = actionsValidation.valid ? actionsValidation.sanitized : null;
    }

    // Sanitize witnesses (optional)
    const sanitizedWitnesses = witnesses ? sanitizePlainText(witnesses).substring(0, 500) : null;

    // Sanitize image URL (optional) - basic validation
    let sanitizedImage = null;
    if (image) {
      const imageStr = sanitizePlainText(image).substring(0, 500);
      // Basic URL validation
      if (imageStr.startsWith('http://') || imageStr.startsWith('https://') || imageStr.startsWith('data:image/')) {
        sanitizedImage = imageStr;
      }
    }

    // Get user's business for linking
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        businessId: true,
        areaId: true,
      },
    });

    if (!user || !user.businessId) {
      return NextResponse.json(
        { success: false, error: "User not associated with a business" },
        { status: 400 }
      );
    }

    // Determine if this is incident or feedback
    if (type === "INCIDENT") {
      // Create incident record with sanitized data
      const incident = await prisma.incident.create({
        data: {
          userId: user.id,
          businessId: user.businessId,
          houseId: houseId || null,
          type: incidentType,
          description: sanitizedDescription,
          time: new Date(time),
          actionsTaken: sanitizedActionsTaken,
          followUp: Boolean(followUp),
          emergency: Boolean(emergency),
          image: sanitizedImage,
          evidenceUrl: sanitizedWitnesses,
        },
      });

      return NextResponse.json({
        success: true,
        incident,
        message: "Incident reported successfully",
      });
    } else {
      // Create feedback record with sanitized data
      const feedback = await prisma.tripFeedback.create({
        data: {
          userId: user.id,
          type: "NOTE",
          message: sanitizedDescription,
          resolved: false,
        },
      });

      return NextResponse.json({
        success: true,
        feedback,
        message: "Feedback submitted successfully",
      });
    }
  } catch (error) {
    console.error("Error creating incident/feedback:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
