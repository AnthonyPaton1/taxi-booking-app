// app/dashboard/driver/edit/page.jsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DriverEditForm from "@/components/forms/driver/DriverEditForm";
import CheckoutSteps from "@/components/shared/header/driverSteps";

export default async function DriverEditPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch user with driver and all relations
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      driver: {
        include: {
          accessibilityProfile: true,
          compliance: true,
        },
      },
    },
  });

  if (!user?.driver) {
    return (

      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">
            No driver profile found. Please complete onboarding first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    <CheckoutSteps current={6}/>
    <div className="py-10 px-6">
      <DriverEditForm
        driver={user.driver}
        accessibilityProfile={user.driver.accessibilityProfile}
        compliance={user.driver.compliance}
        />
    </div>
        </>
  );
}