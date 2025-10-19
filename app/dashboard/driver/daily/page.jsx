
// app/dashboard/driver/daily/page.jsx
export const dynamic = "force-dynamic";

import CheckoutSteps from "@/components/shared/header/driverSteps";
import { getDriverBookingsForToday } from "@/app/actions/driver/getDriverBookings";
import TodaysBookingCard from "@/components/shared/TodaysBookingCard";

export default async function DailyJobSheet() {
  const result = await getDriverBookingsForToday();

  if (!result.success) {
    return (
      <>
        <CheckoutSteps current={1} />
        <div className="p-6">
          <p className="text-red-600">Error loading today's bookings: {result.error}</p>
        </div>
      </>
    );
  }

  const instantBookings = result.instant || [];
  const advancedBookings = result.advanced || [];
  const totalJobs = instantBookings.length + advancedBookings.length;

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Today's Job Sheet
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{totalJobs}</p>
            <p className="text-sm text-gray-600">jobs today</p>
          </div>
        </div>

        {totalJobs === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No bookings for today.</p>
            <p className="text-gray-500 text-sm mt-2">
              Check the instant bookings page to accept new rides.
            </p>
          </div>
        ) : (
          <>
            {/* Instant Bookings Section */}
            {instantBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Instant Bookings ({instantBookings.length})
                </h2>
                <div className="grid gap-4">
                  {instantBookings.map((booking) => (
                    <TodaysBookingCard
                      key={booking.id}
                      booking={booking}
                      type="instant"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Bookings Section */}
            {advancedBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Advanced Bookings ({advancedBookings.length})
                </h2>
                <div className="grid gap-4">
                  {advancedBookings.map((booking) => (
                    <TodaysBookingCard
                      key={booking.id}
                      booking={booking}
                      type="advanced"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}