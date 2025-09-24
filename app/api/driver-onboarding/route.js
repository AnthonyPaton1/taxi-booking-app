// app/api/driver-onboarding/route.ts
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // TODO: persist whatever profile fields you keep
  await prisma.user.update({
    where: { id: session.user.id },
    data: { driverOnboarded: true }
  });

  return Response.json({ success: true });
}