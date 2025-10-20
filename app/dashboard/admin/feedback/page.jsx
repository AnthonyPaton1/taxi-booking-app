// app/dashboard/admin/feedback/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminFeedbackClient from "@/components/dashboard/business/admin/adminFeedbackClient";

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get all feedback/complaints
  const feedback = await prisma.tripFeedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Last 100 feedback items
  }).catch(() => []);

  return (
    <AdminFeedbackClient feedback={feedback} />
  );
}