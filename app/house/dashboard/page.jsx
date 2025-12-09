// app/house/dashboard/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import HouseDashboardClient from "@/components/house/HouseDashboardClient";

async function getHouseSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("house-session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.houseSession.findUnique({
    where: { token: sessionToken },
    include: {
      house: {
        select: {
          id: true,
          label: true,
          line1: true,
          city: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export default async function HouseDashboardPage() {
  const session = await getHouseSession();

  if (!session) {
    redirect("/house/login");
  }

  return (
    <HouseDashboardClient
      houseId={session.houseId}
      houseName={session.house.label}
      houseAddress={`${session.house.line1}, ${session.house.city}`}
    />
  );
}