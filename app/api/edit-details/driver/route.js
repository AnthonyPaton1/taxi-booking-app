import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { driver: true },
  });

  if (!user?.driver) return new Response("Driver not found", { status: 404 });

  return Response.json({
    name: user.name,
    phone: user.phone,
    vehicleType: user.driver.vehicleType,
    licenseNumber: user.driver.licenseNumber,
    wheelchairAccessible: user.driver.wheelchairAccessible,
  });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const data = await req.json();

  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      phone: data.phone,
      driver: {
        update: {
          vehicleType: data.vehicleType,
          licenseNumber: data.licenseNumber,
          wheelchairAccessible: data.wheelchairAccessible,
        },
      },
    },
  });

  return Response.json({ success: true, updated });
}