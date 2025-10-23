// app/api/incidents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

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
      houseId, // Optional - if manager reporting from house context
    } = body;

    // Validation
    if (!description || !time) {
      return NextResponse.json(
        { success: false, error: "Description and time are required" },
        { status: 400 }
      );
    }

    if (type === "INCIDENT" && !incidentType) {
      return NextResponse.json(
        { success: false, error: "Incident type is required for incidents" },
        { status: 400 }
      );
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
      // Create incident record
      const incident = await prisma.incident.create({
        data: {
          userId: user.id,
          businessId: user.businessId,
          houseId: houseId || null,
          type: incidentType,
          description: description.trim(),
          time: new Date(time),
          actionsTaken: actionsTaken?.trim() || null,
          followUp: followUp || false,
          emergency: emergency || false,
          image: image || null,
          evidenceUrl: witnesses || null, // Store witnesses in evidenceUrl field
        },
      });

      return NextResponse.json({
        success: true,
        incident,
        message: "Incident reported successfully",
      });
    } else {
      // Create feedback record
      const feedback = await prisma.tripFeedback.create({
        data: {
          userId: user.id,
          type: "NOTE",
          message: description.trim(),
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
