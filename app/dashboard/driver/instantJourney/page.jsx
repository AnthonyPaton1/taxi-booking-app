export const dynamic = "force-dynamic";
import { getInstantBookings} from "@/app/actions/bookings/instantBookings"
import JourneyCard from "@/components/shared/journeyCard";

export default async function InstantJourneyPage() {
  const bookings = await getInstantBookings();

  return (
    <>
    
    <h1 className="font-bold text-2xl ">Latest Jobs</h1>
    {bookings.length === 0 ? (
  <p className="text-gray-600">No instant bookings currently available.</p>
) : (
  <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {bookings.map((booking) => (
      <JourneyCard key={booking.id} booking={booking} />
    ))}
  </div>
)}
    </>
  );
}