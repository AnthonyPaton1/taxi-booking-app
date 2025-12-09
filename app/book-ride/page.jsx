// app/book-ride/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dynamic from 'next/dynamic';

const JourneyBookingForm = dynamic(
  () => import('@/components/forms/journeyBookingForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
    
  }
);

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