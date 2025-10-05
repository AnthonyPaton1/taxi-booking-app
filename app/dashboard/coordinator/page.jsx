import CheckoutSteps from "@/components/shared/header/coordinatorSteps";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import CoordinatorDashboard from "@/components/dashboard/business/coordinatorDashboard";
import CoordinatorOnboardingForm from "@/components/forms/business/coordinatorOnboardingForm"

export default async function CoordinatorHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const coordinator = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: true,
    },
  });

  const hasOnboarded = coordinator?.hasOnboarded;

  return (
    <>
      <CheckoutSteps current={0} />
      <div className="max-w-3xl mx-auto mt-10">
        {!hasOnboarded ? (
          <CoordinatorOnboardingForm />
        ) : (
          <CoordinatorDashboard coordinator={coordinator} />
        )}
      </div>
    </>
  );
}