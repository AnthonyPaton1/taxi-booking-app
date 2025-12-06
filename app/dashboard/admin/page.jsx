// app/dashboard/admin/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminDashboardClient from "@/components/dashboard/business/admin/adminDashboardClient";
import BusinessOnboardingForm from "@/components/forms/business/BusinessOnboardingForm";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Check if admin has onboarded their business
  if (!user.adminOnboarded || !user.business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to the Platform!
            </h1>
            <p className="text-gray-600">
              Let's set up your business and get started
            </p>
          </div>
          <BusinessOnboardingForm
            prefillData={{
              name: user.name,
              contactEmail: user.email,
              businessName: user.business?.name,
              contactNumber: user.business?.phone,
            }}
          />
        </div>
      </div>
    );
  }

  // Get all areas
  const areas = await prisma.area.findMany({
    include: {
      _count: {
        select: {
          users: true,
          house: true,
        },
      },
      users: {
        where: {
          role: "COORDINATOR",
          businessId: user.businessId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          coordinatorOnboarded: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get all coordinators
  const coordinators = await prisma.user.findMany({
    where: {
      role: "COORDINATOR",
      businessId: user.businessId,
    },
    include: {
      area: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get all managers
  const managers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      businessId: user.businessId,
    },
    include: {
      area: {
        select: {
          name: true,
        },
      },
      houses: {
        include: {
          residents: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get all houses
  const houses = await prisma.house.findMany({
    include: {
      area: {
        select: {
          name: true,
        },
      },
      manager: {
        select: {
          name: true,
        },
      },
      residents: true,
    },
  });

  //  Get total bookings stats (unified)
  const bookingsCount = await prisma.booking.count({
    where: {
      deletedAt: null,
    },
  });

  // Get feedback/complaints (if exists)
  const feedbackCount = await prisma.tripFeedback.count().catch(() => 0);

  const stats = {
    totalAreas: areas.length,
    totalCoordinators: coordinators.length,
    totalManagers: managers.length,
    totalHouses: houses.length,
    totalResidents: houses.reduce((sum, h) => sum + h.residents.length, 0),
    totalBookings: bookingsCount,  // Single count
    feedbackCount,
  };

  return (
    <AdminDashboardClient
      user={user}
      business={user.business}
      areas={areas}
      coordinators={coordinators}
      managers={managers}
      houses={houses}
      stats={stats}
    />
  );
}