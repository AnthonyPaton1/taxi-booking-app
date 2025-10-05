// app/auth/redirect/page.jsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);
  console.log("SESSION:", session);
  console.log("ROLE:", session?.user?.role);

  if (!session || !session.user?.role) {
    return redirect("/unauthorised");
  }

  const role = session.user.role;

  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin/mainPage";
    case "ADMIN":
      return redirect("/dashboard/admin");
    case "COORDINATOR":
      return redirect("/dashboard/coordinator");
    case "MANAGER":
      return redirect("/dashboard/manager");
    case "DRIVER":
      return redirect("/dashboard/driver");
    default:
      return redirect("/unauthorised");
  }
}
