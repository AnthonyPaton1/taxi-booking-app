// app/api/bookings/advanced/create/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate block booking
    if (data.isBlockBooking) {
      if (!data.blockRides || data.blockRides.length === 0) {
        return NextResponse.json(
          { error: "Block booking must have at least one ride date" },
          { status: 400 }
        );
      }

      // Validate each ride has required times
      for (const ride of data.blockRides) {
        if (!ride.date || !ride.pickupTime) {
          return NextResponse.json(
            { error: "Each ride must have a date and pickup time" },
            { status: 400 }
          );
        }
        if (data.roundTrip && !ride.returnTime) {
          return NextResponse.json(
            { error: "Return time required for round trip rides" },
            { status: 400 }
          );
        }
      }
    }

    // Get the user's business
    const manager = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        businessId: true,
      },
    });

    if (!manager?.businessId) {
      return NextResponse.json(
        { error: "Manager profile not found" },
        { status: 404 }
      );
    }

    // Create the booking
    const booking = await prisma.advancedBooking.create({
      data: {
        businessId: manager.businessId,
        pickupLocation: data.pickupLocation,
        pickupPostcode: data.pickupPostcode,
        dropoffLocation: data.dropoffLocation,
        dropoffPostcode: data.dropoffPostcode,
        pickupTime: new Date(data.pickupTime),
        returnTime: data.returnTime ? new Date(data.returnTime) : null,
        roundTrip: data.roundTrip || false,
        initials: data.initials || [],
        passengerCount: parseInt(data.passengerCount),
        wheelchairUsers: parseInt(data.wheelchairUsers) || 0,
        wheelchairAccess: data.wheelchairAccess || false,
        femaleDriverOnly: data.femaleDriverOnly || false,
        carerPresent: data.carerPresent || false,
        assistanceAnimal: data.assistanceAnimal || false,
        additionalNeeds: data.additionalNeeds || null,
        managerNotes: data.managerNotes || null,
        
        // Block booking fields
        isBlockBooking: data.isBlockBooking || false,
        blockRides: data.isBlockBooking ? data.blockRides : null,
        totalRidesInBlock: data.isBlockBooking ? data.blockRides.length : 1,
        blockNotes: data.isBlockBooking ? data.blockNotes : null,
        
        createdBy: session.user.name || session.user.email,
        status: "PENDING",
      },
      include: {
        business: true,
      },
    });

    // TODO: Notify drivers about new booking
    // If block booking, notification should emphasize it's all-or-nothing

    return NextResponse.json({
      success: true,
      booking,
      message: data.isBlockBooking 
        ? `Block booking created with ${data.blockRides.length} rides`
        : "Booking created successfully"
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    );
  }
}