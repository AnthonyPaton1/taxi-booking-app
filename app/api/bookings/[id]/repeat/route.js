// app/api/bookings/[id]/repeat/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dates } = await req.json();
    const { id } = await params;  // ✅ Added await

    // ✅ Verify the original booking exists
    const originalBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: true,
        accessibilityProfile: true,
        acceptedBid: {
          include: {
            driver: {
              include: {
                user: true,
                accessibilityProfile: true
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
    if (originalBooking.business?.managerId !== session.user.id) {
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

      // ✅ Create the new booking with all the same details
      const newBooking = await prisma.booking.create({
        data: {
          businessId: originalBooking.businessId,
          createdById: session.user.id,  // ✅ Required field
          pickupLocation: originalBooking.pickupLocation,
          pickupLatitude: originalBooking.pickupLatitude,
          pickupLongitude: originalBooking.pickupLongitude,
          dropoffLocation: originalBooking.dropoffLocation,
          dropoffLatitude: originalBooking.dropoffLatitude,
          dropoffLongitude: originalBooking.dropoffLongitude,
          pickupTime: pickupDate,
          returnTime: returnDate,
          initials: originalBooking.initials,
          visibility: originalBooking.visibility,
          status: "PENDING",  // ✅ Open for bids
          
          // ✅ Create accessibility profile
          accessibilityProfile: {
            create: {
              vehicleClassRequired: originalBooking.accessibilityProfile.vehicleClassRequired,
              ambulatoryPassengers: originalBooking.accessibilityProfile.ambulatoryPassengers,
              wheelchairUsersStaySeated: originalBooking.accessibilityProfile.wheelchairUsersStaySeated,
              wheelchairUsersCanTransfer: originalBooking.accessibilityProfile.wheelchairUsersCanTransfer,
              femaleDriverOnly: originalBooking.accessibilityProfile.femaleDriverOnly,
              carerPresent: originalBooking.accessibilityProfile.carerPresent,
              escortRequired: originalBooking.accessibilityProfile.escortRequired,
              highRoof: originalBooking.accessibilityProfile.highRoof,
              seatTransferHelp: originalBooking.accessibilityProfile.seatTransferHelp,
              mobilityAidStorage: originalBooking.accessibilityProfile.mobilityAidStorage,
              electricScooterStorage: originalBooking.accessibilityProfile.electricScooterStorage,
              quietEnvironment: originalBooking.accessibilityProfile.quietEnvironment,
              noConversation: originalBooking.accessibilityProfile.noConversation,
              noScents: originalBooking.accessibilityProfile.noScents,
              visualSchedule: originalBooking.accessibilityProfile.visualSchedule,
              signLanguageRequired: originalBooking.accessibilityProfile.signLanguageRequired,
              textOnlyCommunication: originalBooking.accessibilityProfile.textOnlyCommunication,
              assistanceRequired: originalBooking.accessibilityProfile.assistanceRequired,
              assistanceAnimal: originalBooking.accessibilityProfile.assistanceAnimal,
              familiarDriverOnly: originalBooking.accessibilityProfile.familiarDriverOnly,
              medicationOnBoard: originalBooking.accessibilityProfile.medicationOnBoard,
              firstAidTrained: originalBooking.accessibilityProfile.firstAidTrained,
              additionalNeeds: originalBooking.accessibilityProfile.additionalNeeds,
            }
          },
        }
      });

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