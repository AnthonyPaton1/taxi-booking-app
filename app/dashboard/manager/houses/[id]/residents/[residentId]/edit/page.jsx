// app/dashboard/manager/houses/[id]/residents/[residentId]/edit/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EditResidentForm from "@/components/forms/business/editResidentForm";

export default async function EditResidentPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const { id: houseId, residentId } = params;

  // Get the user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Get the house and verify ownership
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      residents: {
        select: {
          id: true,
          name: true,
          initials: true,
        },
      },
    },
  });

  if (!house || house.managerId !== user.id) {
    notFound();
  }

  // Get the specific resident
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
  });

  if (!resident || resident.houseId !== houseId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <EditResidentForm house={house} resident={resident} />
      </div>
    </div>
  );
}