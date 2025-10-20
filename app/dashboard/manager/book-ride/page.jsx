// app/dashboard/manager/book-ride/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ManagerBookRideForm from "@/components/forms/business/managerBookRideForm";

export default async function BookRidePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      houses: {
        include: {
          residents: {
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          label: "asc",  // ✅ Changed from 'name' to 'label'
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Check if manager has houses
  if (user.houses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Houses Found
            </h1>
            <p className="text-gray-600 mb-6">
              You need to add at least one house before you can create bookings.
            </p>
            <a
              href="/dashboard/manager/houses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Manage Houses
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <ManagerBookRideForm houses={user.houses} />;
}