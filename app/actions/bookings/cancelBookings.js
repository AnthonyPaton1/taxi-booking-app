// app/actions/bookings/cancelBooking.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function cancelBooking({ bookingId }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    // Check if booking exists and is cancellable
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return { success: false, error: "Cannot cancel a completed or already cancelled booking" };
    }

    // Update booking status to CANCELLED
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
      },
    });

    // Revalidate the bookings pages
    revalidatePath("/dashboard/manager/bookings");
    revalidatePath(`/dashboard/manager/bookings/${bookingId}`);

    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}