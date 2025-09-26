// app/dashboard/driver/daily/page.jsx;

import DriverJourneyCard from "@/components/shared/DriverJourneyCard";
import { getDriverBookingsForToday } from "@/app/actions/driver/getDriverBookings";

export default async function DailyJobSheet() {
  
  const bookings = await getDriverBookingsForToday()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Today's Job Sheet</h1>
      {bookings.length === 0 ? (
        <p>No bookings for today.</p>
      ) : (
        bookings.map((booking) => (
          <DriverJourneyCard key={booking.id} booking={booking} />
        ))
      )}
    </div>
  );
}