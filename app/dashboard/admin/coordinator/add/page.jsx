// app/dashboard/admin/coordinators/add/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AddCoordinatorForm from "@/components/forms/business/admin/addCoordinatorForm";

export default async function AddCoordinatorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Get admin user with business
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adminOfBusiness: true,
    },
  });

  if (!user || user.role !== "ADMIN" || !user.adminOfBusiness) {
    redirect("/dashboard");
  }

  // Get existing areas for the business
  const areas = await prisma.area.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <AddCoordinatorForm 
          businessId={user.adminOfBusiness.id} 
          existingAreas={areas}
        />
      </div>
    </div>
  );
}