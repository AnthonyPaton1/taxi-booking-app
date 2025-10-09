// app/dashboard/driver/page.jsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DriverDashboardClient from "@/components/dashboard/driver/DriverDashboardClient";
import DriverOnboardingForm from "@/components/forms/driver/DriverOnboardingForm";

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email },
    include: { driver: true },
  });

  const hasOnboarded = !!user?.driver;

  if (!session || !user) {
    redirect("/auth/login");
  }

  return (
    <>
      {!hasOnboarded ? (
        <DriverOnboardingForm />
      ) : (
        <DriverDashboardClient
          user={user}
          jobsToday={[]} // or await prisma.jobs.findMany(...)
          advancedJobs={[]}
          notifications={[]}
          messages={[]}
        />
      )}
    </>
  );
}