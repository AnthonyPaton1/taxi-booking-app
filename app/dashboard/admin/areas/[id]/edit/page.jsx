// app/dashboard/admin/areas/[id]/edit/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import EditAreaForm from "@/components/dashboard/business/admin/EditAreaForm";

export default async function EditAreaPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get the area
  const area = await prisma.area.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          users: true,
          house: true, // ✅ Changed from houses to house
        },
      },
    },
  });

  if (!area) {
    redirect("/dashboard/admin/areas");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <EditAreaForm area={area} />
      </div>
    </div>
  );
}