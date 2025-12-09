// lib/houseAuth.js
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getHouseSession(request) {
  try {
    const cookieStore = await cookies(); // CHANGED: await cookies()
    const sessionToken = cookieStore.get("house-session")?.value;

    if (!sessionToken) {
      return null;
    }

    // Verify session token
    const session = await prisma.houseSession.findUnique({
      where: { token: sessionToken },
      include: {
        house: {
          select: {
            id: true,
            businessId: true,
            label: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      houseId: session.houseId,
      house: session.house,
    };
  } catch (error) {
    console.error("Error getting house session:", error);
    return null;
  }
}