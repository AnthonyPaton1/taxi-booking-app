// app/api/user/[id]/route.js
import { prisma } from "@/lib/db";

export async function GET(req, context) {
  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      adminOfBusiness: true,
      business: true, // for businessId
      houses: {
        include: {
          area: true, // for area.label
        },
      },
    },
  });

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}