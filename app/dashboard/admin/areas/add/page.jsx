// app/dashboard/admin/areas/add/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AddAreaForm from "@/components/forms/business/admin/addAreaForm";

export default async function AddAreaPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <AddAreaForm />
      </div>
    </div>
  );
}