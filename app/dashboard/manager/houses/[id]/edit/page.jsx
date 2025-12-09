import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import EditHouseClient from "@/components/dashboard/business/manager/editHouseClient";

export default async function EditHousePage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/auth/signin");
  }

  const { id: houseId } = await params;

  // Fetch the house details
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      manager: true,
    },
  });

  if (!house) {
    redirect("/dashboard/manager/houses");
  }

  // Ensure this house belongs to the logged-in manager
  if (house.manager.email !== session.user.email) {
    redirect("/dashboard/manager/houses");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit House</h1>
      <EditHouseClient house={house} />
    </div>
  );
}