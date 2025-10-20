// app/api/bookings/instant/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      houseId,
      residentId,
      pickupLocation,
      dropoffLocation,
      pickupPostcode,
      dropoffPostcode,
      pickupTime,
      returnTime,
      roundTrip,
      passengerCount,
      wheelchairUsers,
      wheelchairAccess,
      carerPresent,
      nonWAVvehicle,
      femaleDriverOnly,
      quietEnvironment,
      assistanceRequired,
      noConversation,
      visualSchedule,
      assistanceAnimal,
      familiarDriverOnly,
      escortRequired,
      signLanguageRequired,
      textOnlyCommunication,
      medicationOnBoard,
      additionalNeeds,
      managerNotes,
      createdBy,
      physicalRequirements = [],
    } = body;

    // Validation
    if (!houseId || !residentId || !pickupLocation || !dropoffLocation || !pickupTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the manager owns this house
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const house = await prisma.house.findUnique({
      where: { id: houseId },
    });

    if (!house || house.managerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "House not found or unauthorized" },
        { status: 403 }
      );
    }

    // Verify the resident belongs to this house
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
    });

    if (!resident || resident.houseId !== houseId) {
      return NextResponse.json(
        { success: false, error: "Resident not found in this house" },
        { status: 400 }
      );
    }

    // Create the instant booking
    const booking = await prisma.instantBooking.create({
      data: {
        residentId,
        pickupLocation,
        dropoffLocation,
        pickupPostcode,
        dropoffPostcode,
        pickupTime: new Date(pickupTime),
        returnTime: returnTime ? new Date(returnTime) : null,
        roundTrip,
        passengerCount,
        wheelchairUsers,
        wheelchairAccess,
        carerPresent,
        nonWAVvehicle,
        femaleDriverOnly,
        quietEnvironment,
        assistanceRequired,
        noConversation,
        visualSchedule,
        assistanceAnimal,
        familiarDriverOnly,
        escortRequired,
        signLanguageRequired,
        textOnlyCommunication,
        medicationOnBoard,
        additionalNeeds,
        managerNotes,
        createdBy,
        createdById: user.id,
        status: "PENDING", // Instant bookings start as PENDING until driver accepts
      },
    });

    // TODO: Send notifications to available drivers
    // You can add driver notification logic here later

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: "Instant booking created successfully",
    });
  } catch (error) {
    console.error("Error creating instant booking:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}