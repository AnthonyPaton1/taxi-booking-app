// app/dashboard/manager/houses/[id]/residents/add/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AddResidentForm from "@/components/forms/business/addResidentForm";

export default async function AddResidentPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const { id: houseId } = await params;

  // Get the house and verify the manager owns it
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <AddResidentForm house={house} />
      </div>
    </div>
  );
}