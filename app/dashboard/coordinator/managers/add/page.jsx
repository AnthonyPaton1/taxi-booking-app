// app/dashboard/coordinator/managers/add/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AddManagerForm from "@/components/forms/business/admin/addAdditionalManagerForm";

export default async function AddManagerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      area: true,
      business: true,
    },
  });

  if (!user || user.role !== "COORDINATOR" || !user.businessId) {
    redirect("/dashboard");
  }

  // Get houses in coordinator's area
  const houses = await prisma.house.findMany({
    where: {
      businessId: user.businessId,
      // Optionally filter by coordinator's area
      // areaId: user.areaId,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <AddManagerForm 
          businessId={user.businessId} 
          coordinatorArea={user.area?.name}
          houses={houses}
        />
      </div>
    </div>
  );
}