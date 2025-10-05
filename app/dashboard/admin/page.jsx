"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import AdminStats from "@/components/dashboard/business/admin-stats";
import { hasAdminAccess } from "@/lib/roles";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const session = await getSession();
      if (!session || !hasAdminAccess(session.user.role)) {
        router.push("/unauthorised");
        return;
      }
      setSession(session);

      try {
        const res = await fetch("/api/admin/houses");
        const data = await res.json();
        setGroupedData(data.grouped || {});
      } catch (err) {
        console.error("Failed to load grouped data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto space-y-8">
      <CheckoutSteps current={0} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-blue-800">
            Welcome to the Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Control panel for managing users, drivers, and more.
          </p>
        </div>
        <Link
          href="/dashboard/incidents"
          className="inline-block text-sm font-medium text-white bg-black hover:bg-red-600 transition px-4 py-2 rounded"
        >
          View Incident Reports
        </Link>
      </div>

      <AdminStats groupedData={groupedData} />
      {Object.entries(groupedData).map(([area, houses]) => (
        <div key={area} className="mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📍 {area}</h2>
          <div className="space-y-4">
            {houses.map((house) => (
              <div
                key={house.id}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <p className="font-semibold text-gray-800">
                  🏠 {house.label} — {house.line1}, {house.postcode}
                </p>
                <p className="text-sm text-gray-600">
                  Internal ID: {house.internalId} | PIN: {house.pin}
                </p>
                {/* Optionally render manager/coordinator/driver if linked in the future */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
