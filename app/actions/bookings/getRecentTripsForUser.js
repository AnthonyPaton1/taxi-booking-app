// app/actions/bookings/getRecentTripsForUser.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

/**
 * Get recent completed trips for the current user (works for both PUBLIC and MANAGER roles)
 * @param {number} limit - Number of trips to return (default 10)
 */
export async function getRecentTripsForUser(limit = 10) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
        trips: [],
      };
    }

    const userId = session.user.id;

    // Get completed bookings created by this user (works for both PUBLIC and MANAGER)
    const recentTrips = await prisma.advancedBooking.findMany({
      where: {
        createdById: userId,
        status: "COMPLETED",
      },
      select: {
        id: true,
        pickupLocation: true,
        dropoffLocation: true,
        pickupTime: true,
        // Get accessibility data from the relation
        accessibilityProfile: {
          select: {
            passengerCount: true,
            wheelchairUsers: true,
            wheelchairAccess: true,
            carerPresent: true,
            femaleDriverOnly: true,
            quietEnvironment: true,
            assistanceRequired: true,
            noConversation: true,
            visualSchedule: true,
            assistanceAnimal: true,
            familiarDriverOnly: true,
            escortRequired: true,
            signLanguageRequired: true,
            textOnlyCommunication: true,
            medicationOnBoard: true,
            additionalNeeds: true,
          },
        },
        acceptedBid: {
          select: {
            amountCents: true,
            driver: {
              select: {
                name: true,
                vehicleType: true,
              },
            },
          },
        },
      },
      orderBy: {
        pickupTime: "desc",
      },
      take: limit,
    });

    return {
      success: true,
      trips: recentTrips,
    };
  } catch (error) {
    console.error("Error fetching recent trips:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch recent trips",
      trips: [],
    };
  }
}