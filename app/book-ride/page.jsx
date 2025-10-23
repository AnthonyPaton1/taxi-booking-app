// app/book-ride/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import JourneyBookingForm from "@/components/forms/JourneyBookingForm";

export const metadata = {
  title: "Book a Journey - Accessible Transport",
  description: "Book your accessible transport journey",
};

export default async function BookRidePage() {
  const session = await getServerSession(authOptions);

  // Must be logged in
  if (!session) {
    redirect("/auth/login?callbackUrl=/book-ride");
  }

  // Must be public user
  if (session.user.role !== "PUBLIC") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Book a Journey</h1>
          <p className="text-gray-600 mt-2">
            Schedule your accessible transport booking
          </p>
        </div>

        <JourneyBookingForm />
      </div>
    </div>
  );
}