// app/dashboard/driver/advanced/page.jsx

export const dynamic = "force-dynamic"; // ensure fresh data on each load
import CheckoutSteps from "@/components/shared/header/driverSteps";
import { getAvailableAdvancedBookings } from "@/app/actions/driver/getAvailableAdvancedBookings"; 
import JourneyCard from "@/components/shared/journeyCard";


export default async function DriverAdvancedPage() {
  const bookings = await getAvailableAdvancedBookings();

  return (
    <>
    <CheckoutSteps current={2} />
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Advanced Bookings – Open for Bids</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600">No advanced bookings currently available.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <JourneyCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </main>
      </>
  );
}