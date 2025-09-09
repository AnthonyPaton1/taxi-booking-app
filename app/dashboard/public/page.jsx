// app/dashboard/public/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PublicDashboardLayout from "@/components/dashboard/public/public-dashboard";

export default async function PublicDashboard() {
  const session = await getServerSession(authOptions);

  // Basic protection: must be logged in
  if (!session) {
    return redirect("/unauthorised");
  }

  return <PublicDashboardLayout user={session.user} />;
}
