// app/api/user/[id]/route.js
import { prisma } from "@/lib/db";

export async function GET(req, { params }) {
  const { id } = (await params);

  const user = await prisma.user.findUnique({
    where: { id },
    include: { adminOfBusiness: true }, // make sure this is correct
  });

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}