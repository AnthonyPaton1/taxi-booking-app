// app/api/incidents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { validateTextArea, sanitizePlainText } from "@/lib/validation";

export async function POST(request) {
  try {
    // Check for either user session OR house session
    const userSession = await getServerSession(authOptions);
    

    let userId = null;
    let businessId = null;
    let houseId = null;
    let reportedBy = null;

    // Authorization: Must be driver/manager OR valid house session
    if (userSession && ["DRIVER", "MANAGER"].includes(userSession.user.role)) {
      // User-based submission (existing logic)
      const user = await prisma.user.findUnique({
        where: { id: userSession.user.id },
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

      userId = user.id;
      businessId = user.businessId;
      reportedBy = userSession.user.role;
    } else if (userSession?.user?.role === "HOUSE_STAFF" && userSession.user.houseId) {
      // House-based submission (NEW)
      const house = await prisma.house.findUnique({
        where: { id: userSession.user.houseId },
        select: {
          id: true,
          businessId: true,
        },
      });

      if (!house) {
        return NextResponse.json(
          { success: false, error: "Invalid house session" },
          { status: 401 }
        );
      }

      houseId = house.id;
      businessId = house.businessId;
      reportedBy = "HOUSE_STAFF";
    } else {
      // No valid auth
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
      houseId: bodyHouseId, // House ID from form (for drivers/managers)
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

    // For house staff, verify they can only report for their own house
    if (reportedBy === "HOUSE_STAFF" && bodyHouseId && bodyHouseId !== houseId) {
      return NextResponse.json(
        { success: false, error: "Cannot report incidents for other houses" },
        { status: 403 }
      );
    }

    // Determine final houseId (house staff use their session, users use form input)
    const finalHouseId = houseId || bodyHouseId || null;

    // Determine if this is incident or feedback
    if (type === "INCIDENT") {
      // Create incident record with sanitized data
      const incident = await prisma.incident.create({
        data: {
          userId: userId, // null for house staff
          businessId: businessId,
          houseId: finalHouseId,
          type: incidentType,
          description: sanitizedDescription,
          time: new Date(time),
          actionsTaken: sanitizedActionsTaken,
          followUp: Boolean(followUp),
          emergency: Boolean(emergency),
          image: sanitizedImage,
          evidenceUrl: sanitizedWitnesses,
          reportedBy: reportedBy, // NEW: Track who reported it
        },
      });

      return NextResponse.json({
        success: true,
        incident,
        message: "Incident reported successfully",
      });
    } else {
      // Feedback only available for user sessions (not house staff)
      if (reportedBy === "HOUSE_STAFF") {
        return NextResponse.json(
          { success: false, error: "House staff can only report incidents" },
          { status: 400 }
        );
      }

      const feedback = await prisma.tripFeedback.create({
        data: {
          userId: userId,
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