// app/dashboard/public/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PublicDashboardClient from "@/components/dashboard/public/PublicDashboardClient";

export default async function PublicDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/unauthorised");
  }

  return <PublicDashboardClient user={session.user} />;
}
