// app/dashboard/coordinator/incidents/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoordinatorIncidentsClient from "@/components/dashboard/business/coordinator/coordinatorIncidentsClient";

export default async function CoordinatorIncidentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      area: true,
      business: true,
    },
  });

  if (!user || !user.coordinatorOnboarded) {
    redirect("/dashboard/coordinator");
  }

  // Get all incidents from houses in this area
  const incidents = await prisma.incident.findMany({
    where: {
      house: {
        areaId: user.areaId,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      house: {
        select: {
          label: true,
          manager: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      time: "desc",
    },
  });

  // Get all feedback/complaints from trips in this area
  const feedback = await prisma.tripFeedback.findMany({
    where: {
      OR: [
        {
          advancedBooking: {
            createdBy: {
              areaId: user.areaId,
            },
          },
        },
        {
          instantBooking: {
            createdBy: {
              areaId: user.areaId,
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      advancedBooking: {
        select: {
          pickupLocation: true,
          dropoffLocation: true,
          pickupTime: true,
        },
      },
      instantBooking: {
        select: {
          pickupLocation: true,
          dropoffLocation: true,
          pickupTime: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <CoordinatorIncidentsClient
      user={user}
      incidents={incidents}
      feedback={feedback}
    />
  );
}