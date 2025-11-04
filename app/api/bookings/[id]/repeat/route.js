// app/api/bookings/[id]/repeat/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, dates } = await req.json();
    const { id } = params;

    // Verify the original booking exists and belongs to the user's business
    const originalBooking = await prisma.advancedBooking.findUnique({
      where: { id },
      include: {
        business: true,
        acceptedBid: {
          include: {
            driver: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!originalBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user has access to this business
    if (originalBooking.business.managerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create repeat bookings
    const createdBookings = [];
    
    for (const dateObj of dates) {
      // Parse the date and times
      const pickupDate = new Date(dateObj.date);
      const [pickupHour, pickupMinute] = dateObj.pickupTime.split(':');
      pickupDate.setHours(parseInt(pickupHour), parseInt(pickupMinute), 0, 0);

      let returnDate = null;
      if (dateObj.returnTime) {
        returnDate = new Date(dateObj.date);
        const [returnHour, returnMinute] = dateObj.returnTime.split(':');
        returnDate.setHours(parseInt(returnHour), parseInt(returnMinute), 0, 0);
      }

      // Create the new booking with all the same details
      const newBooking = await prisma.advancedBooking.create({
        data: {
          businessId: originalBooking.businessId,
          pickupLocation: originalBooking.pickupLocation,
          pickupPostcode: originalBooking.pickupPostcode,
          dropoffLocation: originalBooking.dropoffLocation,
          dropoffPostcode: originalBooking.dropoffPostcode,
          pickupTime: pickupDate,
          returnTime: returnDate,
          roundTrip: originalBooking.roundTrip,
          initials: originalBooking.initials,
          passengerCount: originalBooking.passengerCount,
          wheelchairUsers: originalBooking.wheelchairUsers,
          wheelchairAccess: originalBooking.wheelchairAccess,
          femaleDriverOnly: originalBooking.femaleDriverOnly,
          carerPresent: originalBooking.carerPresent,
          assistanceAnimal: originalBooking.assistanceAnimal,
          additionalNeeds: originalBooking.additionalNeeds,
          managerNotes: originalBooking.managerNotes ? 
            `${originalBooking.managerNotes}\n\n[Repeated from booking #${originalBooking.id}]` : 
            `Repeated from booking #${originalBooking.id}`,
          createdBy: session.user.name || session.user.email,
          status: "PENDING"
        }
      });

      // Booking created as PENDING - open for all drivers to bid
      
      createdBookings.push(newBooking);
    }

    return NextResponse.json({
      success: true,
      bookings: createdBookings,
      count: createdBookings.length
    });

  } catch (error) {
    console.error("Error creating repeat bookings:", error);
    return NextResponse.json(
      { error: "Failed to create repeat bookings" },
      { status: 500 }
    );
  }
}