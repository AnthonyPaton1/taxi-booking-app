// app/dashboard/driver/edit/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import EditDriverProfileClient from "@/components/dashboard/driver/EditDriverProfileClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditDriverPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      driver: {
        include: {
          accessibilityProfile: true,
          compliance: true,
        },
      },
    },
  });

  if (!user || !user.driver ) {
    redirect("/dashboard/driver");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/driver"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Driver Profile
          </h1>

          <EditDriverProfileClient user={user} driver={user.driver} />
        </div>
      </div>
    </div>
  );
}