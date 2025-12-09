// app/dashboard/coordinator/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoordinatorDashboardClient from "@/components/dashboard/business/coordinator/coordinatorDashboardClient";
import CoordinatorOnboardingForm from "@/components/forms/business/coordinatorOnboardingForm";

export default async function CoordinatorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      area: true,
      business: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });



  if (!user) {
    redirect("/login");
  }

  // Check if coordinator has onboarded
  if (!user.coordinatorOnboarded) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.name}!
            </h1>
            <p className="text-gray-600">
              You're managing {user.area?.name}. Let's onboard your managers.
            </p>
          </div>
          <CoordinatorOnboardingForm companyId={user.businessId} coordinatorArea={user.area?.name}  />
          
        </div>
      </div>
    );
  }

  // Get managers in this coordinator's area
  const managers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      areaId: user.areaId,
      businessId: user.businessId,
      deletedAt: null, 
    },
    include: {
      houses: {
        where: {
          deletedAt: null 
        },
        include: {
          residents: true,
        },
      },
    },
  });

  // Calculate stats
  const totalHouses = managers.reduce((sum, m) => sum + m.houses.length, 0);
  const totalResidents = managers.reduce(
    (sum, m) => m.houses.reduce((s, h) => s + h.residents.length, 0),
    0
  );

  // Get incident and feedback counts for the area
  const [incidentCount, feedbackCount] = await Promise.all([
    prisma.incident.count({
      where: {
        house: {
          areaId: user.areaId,
          deletedAt: null, // ✅ Only count incidents for active houses
        },
      },
    }),
    prisma.tripFeedback.count({
      where: {
        type: "COMPLAINT",
      },
    }),
  ]);

  const stats = {
    totalManagers: managers.length,
    totalHouses,
    totalResidents,
    incidentCount,
    feedbackCount,
  };


  return (
    <CoordinatorDashboardClient
      user={user}
      managers={managers}
      stats={stats}
    />
  );
}