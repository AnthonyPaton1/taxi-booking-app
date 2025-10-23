// app/dashboard/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  
  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "COORDINATOR":
      redirect("/dashboard/coordinator");
    case "MANAGER":
      redirect("/dashboard/manager");
    case "DRIVER":
      redirect("/dashboard/driver");
    case "PUBLIC":
      redirect("/dashboard/public");
    default:
      // Fallback for unknown roles
      redirect("/login");
  }
}