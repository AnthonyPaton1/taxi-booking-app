"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function createPublicBooking(formData) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const newRide = await prisma.rideRequest.create({
      data: {
        createdBy: { connect: { id: session.user.id } },
        pickupTime: new Date(formData.pickupTime),
        returnTime: formData.returnTime ? new Date(formData.returnTime) : null,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        wheelchairAccess: formData.wheelchairAccess || false,
        highRoof: formData.highRoof || false,
        carerPresent: formData.carerPresent || false,
        notes: formData.notes || "",
        visibility: "PUBLIC", // or PRIVATE_TO_COMPANY if you want to restrict it
        type: "PUBLIC",
      },
    });

    return { success: true, rideId: newRide.id };
  } catch (error) {
    console.error("Error creating public booking:", error);
    return { success: false };
  }
}
