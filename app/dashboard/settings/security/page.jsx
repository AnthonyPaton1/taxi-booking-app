// app/dashboard/settings/security/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Security Settings - NEAT Transport",
  description: "Manage your password and security settings",
};

export default async function SecuritySettingsPage() {
  const session = await getServerSession(authOptions);

  // Must be logged in
  if (!session) {
    redirect("/login");
  }

  // Get dashboard URL based on role
  const getDashboardUrl = (role) => {
    switch (role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "COORDINATOR":
        return "/dashboard/coordinator";
      case "MANAGER":
        return "/dashboard/manager";
      case "DRIVER":
        return "/dashboard/driver";
      case "PUBLIC":
        return "/dashboard/public";
      default:
        return "/dashboard";
    }
  };

  const dashboardUrl = getDashboardUrl(session.user.role);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href={dashboardUrl}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your password and account security
          </p>
        </div>

        {/* Change Password Form */}
        <ChangePasswordForm />
      </div>
    </div>
  );
}