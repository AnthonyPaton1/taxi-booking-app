// components/dashboard/DriverDashboardClient.jsx
"use client";

import { useState } from "react";
import CheckoutSteps from "@/components/shared/header/driverSteps";

export default function DriverDashboardClient({ user, jobsToday, advancedJobs, notifications, messages }) {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <>
      <CheckoutSteps />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Today's Jobs" value="4" />
          <StatCard title="Advanced Bookings" value="7" />
          <StatCard title="Jobs Completed" value="120" />
          <StatCard title="Earnings" value="£1,230" />
          <StatCard title="Subscription" value="12 days left" />
        </div>

        {/* Job Sheets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobSheet title="Today's Job Sheet" jobs={jobsToday} />
          <JobSheet title="Advanced Job Sheet" jobs={advancedJobs} />
        </div>

        {/* Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Notifications items={notifications} />
          <div className="bg-white p-4 shadow rounded">
            <h2 className="font-semibold mb-2">Availability</h2>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2 rounded ${
                isAvailable
                  ? "bg-green-600 text-white"
                  : "bg-gray-400 text-black"
              }`}
            >
              {isAvailable ? "Online" : "Offline"}
            </button>
          </div>
          <Messages messages={messages} />
        </div>

        {/* Settings */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="font-semibold mb-2">Driver Settings</h2>
          <p>DBS: ✅</p>
          <p>PL Insurance: ✅</p>
          <p>Car Insurance: ✅</p>
          <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded">
            Edit Details
          </button>
        </div>
      </div>
    </>
  );
}

const StatCard = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4 text-center">
    <h3 className="text-gray-600 text-sm">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const JobSheet = ({ title, jobs }) => (
  <div className="bg-white shadow rounded p-4">
    <h2 className="font-semibold mb-2">{title}</h2>
    {jobs.length === 0 ? (
      <p className="text-gray-500">No jobs available.</p>
    ) : (
      <ul className="space-y-2">
        {jobs.map((job, i) => (
          <li key={i} className="p-2 border rounded">
            {job.pickup} &rarr; {job.dropoff} at {job.time}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Notifications = ({ items }) => (
  <div className="bg-white shadow rounded p-4">
    <h2 className="font-semibold mb-2">Notifications</h2>
    {items.length === 0 ? (
      <p className="text-gray-500">No notifications</p>
    ) : (
      <ul className="space-y-2">
        {items.map((n, i) => (
          <li key={i} className="text-sm text-gray-700">
            {n}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Messages = ({ messages }) => (
  <div className="bg-white shadow rounded p-4">
    <h2 className="font-semibold mb-2">Messages</h2>
    {messages.length === 0 ? (
      <p className="text-gray-500">No messages</p>
    ) : (
      <ul className="space-y-2">
        {messages.map((m, i) => (
          <li key={i} className="text-sm text-gray-700">
            {m}
          </li>
        ))}
      </ul>
    )}
  </div>
);