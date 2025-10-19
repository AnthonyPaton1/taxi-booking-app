// app/dashboard/driver/instant/page.jsx
export const dynamic = "force-dynamic";

import CheckoutSteps from "@/components/shared/header/driverSteps";
import { getAvailableInstantBookings } from "@/app/actions/bookings/getBookings";
import InstantBookingCard from "@/components/shared/InstantBookingCard";

export default async function InstantJourneyPage() {
  const result = await getAvailableInstantBookings();

  if (!result.success) {
    return (
      <>
        <CheckoutSteps current={0} />
        <div className="p-6">
          <p className="text-red-600">Error loading bookings: {result.error}</p>
        </div>
      </>
    );
  }

  const bookings = result.bookings || [];

  return (
    <>
      <CheckoutSteps current={0} />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl text-gray-900">
            Available Instant Bookings
          </h1>
          <p className="text-sm text-gray-600">
            {bookings.length} available
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              No instant bookings currently available.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon or view advanced bookings to place bids.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => (
              <InstantBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}