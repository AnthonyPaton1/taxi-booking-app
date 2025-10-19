// app/dashboard/driver/advanced/page.jsx
export const dynamic = "force-dynamic";

import CheckoutSteps from "@/components/shared/header/driverSteps";
import { getAvailableAdvancedBookings } from "@/app/actions/bookings/getBookings";
import AdvancedBookingCard from "@/components/shared/AdvancedBookingCard";

export default async function DriverAdvancedPage() {
  const result = await getAvailableAdvancedBookings();

  if (!result.success) {
    return (
      <>
        <CheckoutSteps current={2} />
        <div className="p-6">
          <p className="text-red-600">Error loading bookings: {result.error}</p>
        </div>
      </>
    );
  }

  const bookings = result.bookings || [];

  return (
    <>
      <CheckoutSteps current={2} />
      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Advanced Bookings
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Open for bidding – place your competitive bids below
            </p>
          </div>
          <p className="text-sm text-gray-600">
            {bookings.length} available
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              No advanced bookings currently available.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon for new bidding opportunities.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <AdvancedBookingCard
                key={booking.id}
                booking={booking}
                showBidButton={true}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}