//api/admin/houses/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const houses = await prisma.house.findMany({
      include: {
        
        // You can expand this to include coordinator/manager assignments if stored separately
      },
    });

    // Group by city (or area, depending on your schema)
    const grouped = houses.reduce((acc, house) => {
      const area = house.city || "Unknown";
      if (!acc[area]) acc[area] = [];
      acc[area].push(house);
      return acc;
    }, {});

    return NextResponse.json({ grouped });
  } catch (err) {
    console.error("Failed to fetch houses", err);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
