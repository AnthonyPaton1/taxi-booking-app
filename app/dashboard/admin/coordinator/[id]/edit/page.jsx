// app/dashboard/admin/coordinators/[id]/edit/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import EditCoordinatorForm from "@/components/forms/business/admin/editCoordinatorForm";

export default async function EditCoordinatorPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Await params in Next.js 15
  const { id } = await params;

  // Get coordinator with membership info
  const membership = await prisma.businessMembership.findUnique({
    where: { id: id },
    include: {
      user: {
        include: {
          area: true,
        },
      },
      business: true,
    },
  });

  if (!membership || membership.role !== "COORDINATOR") {
    redirect("/dashboard/admin/coordinators");
  }

  // Get existing areas
  const areas = await prisma.area.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <EditCoordinatorForm 
          coordinator={membership} 
          existingAreas={areas}
        />
      </div>
    </div>
  );
}