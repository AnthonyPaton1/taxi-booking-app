// app/dashboard/manager/houses/add/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AddHouseForm from "@/components/forms/business/addHouseForm";

export default async function AddHousePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  // Get manager's business info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
      area: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user || !user.business || !user.area) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error: Business or area information not found. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <AddHouseForm
        businessId={user.business.id}
        businessName={user.business.name}
        managerId={user.id}
        areaId={user.area.id}
        areaName={user.area.name}
      />
    </div>
  );
}