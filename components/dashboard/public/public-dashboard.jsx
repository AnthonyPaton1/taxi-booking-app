"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicBookingForm from "@/components/forms/publicBookingForm";

const mockJourneys = [
  {
    _id: "abc123",
    from: "123 Main St",
    to: "456 Elm St",
    date: "2025-09-10",
    time: "14:00",
    status: "Pending",
  },
  {
    _id: "xyz789",
    from: "789 Oak Rd",
    to: "321 Pine Ln",
    date: "2025-09-12",
    time: "10:30",
    status: "Approved",
  },
];

export default function PublicDashboardLayout({ user }) {
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    // Later: fetch user-specific journeys
    setJourneys(mockJourneys);
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Welcome {user.name?.split(" ")[0]} to Your NEAT Dashboard
      </h1>

      {/* Booking Form Placeholder */}

      <div className="bg-blue-700 p-4 rounded mb-10 text-white">
        <PublicBookingForm />
      </div>
      {/* Journey Status Table */}
      <section aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="text-2xl font-semibold mb-4">
          Your Bookings
        </h2>

        <ul className="space-y-4" aria-labelledby="journey-heading">
          {journeys.map((journey) => (
            <li
              key={journey._id}
              className="bg-white shadow p-4 rounded flex flex-col md:flex-row md:items-center justify-between"
            >
              <div className="mb-2 md:mb-0">
                <p className="text-lg font-medium text-blue-800">
                  {journey.from} → {journey.to}
                </p>
                <p className="text-sm text-gray-600">
                  {journey.date} at {journey.time}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  Status: {journey.status}
                </p>
                {journey.status === "Pending" && (
                  <Link
                    href={`/dashboard/public/bids/${journey._id}`}
                    className="text-blue-600 underline text-sm mt-1 inline-block"
                  >
                    View Bids
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
