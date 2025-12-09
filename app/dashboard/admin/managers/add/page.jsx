// app/dashboard/admin/managers/add/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AddManagerForm from "@/components/forms/business/admin/addManagerForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminAddManagerPage() {
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

  if (!user || !user.adminOnboarded || !user.business) {
    redirect("/dashboard/admin");
  }

  // Get all areas for this business
  const areas = await prisma.area.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Add House Manager
          </h1>
          <p className="text-gray-600 mb-6">
            House managers oversee care homes and book transport for residents.
          </p>

          <AddManagerForm areas={areas} businessId={user.businessId} />
        </div>
      </div>
    </div>
  );
}