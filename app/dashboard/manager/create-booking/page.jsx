// app/dashboard/manager/book-ride/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ManagerBookRideForm from "@/components/forms/business/managerBookRideForm";

export default async function ManagerBookRidePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  // Fetch houses and residents for the dropdown
  const houses = await prisma.house.findMany({
    include: {
      residents: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Book Advanced Ride</h1>
        <p className="text-gray-600 mt-2">
          Create a booking for a resident. Drivers will bid on this journey.
        </p>
      </div>

      <ManagerBookRideForm houses={houses} />
    </div>
  );
}
