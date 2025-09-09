// app/auth/public-redirect/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function PublicRedirect() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.role) {
    console.log("🔍 Session:", session);
    return redirect("/unauthorised");
  }

  const role = session.user.role;

  if (role === "PUBLIC") {
    return redirect("/dashboard/public");
  }

  // fallback for users trying to spoof roles
  return redirect("/unauthorised");
}
