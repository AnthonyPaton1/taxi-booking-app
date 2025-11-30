// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { invalidateAllMatchingCache } from "@/lib/matching/matchingCache";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({  
      where: { id },
      include: { 
        createdBy: true,
        accessibilityProfile: true 
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const canEdit = 
      existingBooking.createdById === session.user.id ||
      user.role === "ADMIN" ||
      user.role === "COORDINATOR" ||
      (user.role === "MANAGER" && user.businessId === existingBooking.createdBy.businessId);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract fields
    const {
      pickupLocation,
      pickupLatitude,
      pickupLongitude,
      dropoffLocation,
      dropoffLatitude,
      dropoffLongitude,
      pickupTime,
      returnTime,
      bidDeadline,
      visibility,
      initials,
      // Accessibility fields
      passengerCount,        
      wheelchairUsers, 
      femaleDriverOnly,
      carerPresent,
      additionalNeeds,
      vehicleType,
    } = body;

    // Update booking and accessibility profile in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update accessibility profile
      await tx.accessibilityProfile.update({
        where: { id: existingBooking.accessibilityProfileId },
        data: {
          ambulatoryPassengers: passengerCount !== undefined ? parseInt(passengerCount) : undefined,
          wheelchairUsersStaySeated: wheelchairUsers !== undefined ? parseInt(wheelchairUsers) : undefined,
          femaleDriverOnly: femaleDriverOnly !== undefined ? femaleDriverOnly : undefined,
          carerPresent: carerPresent !== undefined ? carerPresent : undefined,
          additionalNeeds: additionalNeeds !== undefined ? additionalNeeds : undefined,
          vehicleClassRequired: vehicleType !== undefined ? vehicleType : undefined,  // ✅ Changed field name
        },
      });

      // Update booking
      return await tx.booking.update({  // ✅ Changed
        where: { id },
        data: {
          pickupLocation,
          pickupLatitude: pickupLatitude ? parseFloat(pickupLatitude) : undefined,
          pickupLongitude: pickupLongitude ? parseFloat(pickupLongitude) : undefined,
          dropoffLocation,
          dropoffLatitude: dropoffLatitude ? parseFloat(dropoffLatitude) : undefined,
          dropoffLongitude: dropoffLongitude ? parseFloat(dropoffLongitude) : undefined,
          pickupTime: pickupTime ? new Date(pickupTime) : undefined,
          returnTime: returnTime ? new Date(returnTime) : null,
          bidDeadline: bidDeadline ? new Date(bidDeadline) : undefined,
          visibility: visibility || undefined,
          initials: initials !== undefined ? initials : undefined,
        },
        include: {
          accessibilityProfile: true,
          bids: {
            include: {
              driver: {
                select: {
                  name: true,
                  phone: true,
                  vehicleClass: true,  // ✅ Updated field name
                },
              },
            },
          },
        },
      });
    });

    // Invalidate matching cache
    await invalidateAllMatchingCache();

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking 
    });

  } catch (error) {
    console.error("❌ Error updating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}