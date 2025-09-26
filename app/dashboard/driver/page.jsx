// app/dashboard/driver/page.jsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DriverDashboardClient from "@/components/dashboard/DriverDashboardClient";

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email },
    include: { driver: true },
  });

  if (!user?.driver) {
    redirect("/onboarding/driver?from=/dashboard/driver");
  }

  // You can fetch mock jobs, notifications, messages here if needed
  const mockData = {
    user,
    jobsToday: [],
    advancedJobs: [],
    notifications: [],
    messages: [],
  };

  return <DriverDashboardClient {...mockData} />;
}