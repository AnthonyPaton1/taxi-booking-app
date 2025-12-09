// app/dashboard/manager/trips/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getRecentTripsForUser } from "@/app/actions/bookings/getRecentTripsForUser";
import RecentTrips from "@/components/dashboard/RecentTrips";
import Link from "next/link";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  // Fetch recent trips for this manager
  // getRecentTripsForUser automatically uses the session userId
  const tripsResult = await getRecentTripsForUser(50);

  if (!tripsResult.success) {
    console.error("Failed to load trips:", tripsResult.error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/dashboard/manager"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Dashboard
          </Link>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip History</h1>
          <p className="text-gray-600 mt-2">
            View and repeat previous trips
          </p>
        </div>

        {/* Recent Trips Component */}
        {tripsResult.success && tripsResult.trips.length > 0 ? (
          <RecentTrips initialTrips={tripsResult.trips} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No completed trips yet
            </h3>
            <p className="text-gray-600 mb-6">
              Once you complete bookings, they'll appear here
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard/manager/book-ride"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Book Advanced Ride
              </Link>
              <Link
                href="/dashboard/manager/instant-booking"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Book Instant Ride
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}