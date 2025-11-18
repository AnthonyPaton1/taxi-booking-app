import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import SavedLocationsManager from "@/components/SavedLocationsManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CoordinatorLocationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Optional: Check if user is actually a coordinator
  if (session.user.role !== "COORDINATOR") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <div>
          <Link
            href="/dashboard/coordinator"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Content */}
        <SavedLocationsManager />
      </div>
    </div>
  );
}