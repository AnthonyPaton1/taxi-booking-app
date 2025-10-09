"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/shared/header/coordinatorSteps";
import CoordinatorDashboard from "@/components/dashboard/business/coordinatorDashboard";
import CoordinatorOnboardingForm from "@/components/forms/business/coordinatorOnboardingForm";
import { hasCoordinatorAccess } from "@/lib/roles";
import CoordinatorStats from "@/components/dashboard/business/coordinator-stats";

export default function CoordinatorHomePage() {
  const [session, setSession] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const groupedData = coordinator?.houses?.reduce((acc, house) => {
  const area = house.area?.label || "Unassigned";
  if (!acc[area]) acc[area] = [];
  acc[area].push(house);
  return acc;
}, {}) || {};

  useEffect(() => {
    const load = async () => {
      const session = await getSession();

      if (!session || !hasCoordinatorAccess(session.user.role)) {
        router.push("/unauthorised");
        return;
      }

      setSession(session);

      try {
        const userRes = await fetch(`/api/user/${session.user.id}`);
        const user = await userRes.json();
        setCoordinator(user);
      } catch (err) {
        console.error("Error fetching coordinator data:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  const hasOnboarded = coordinator?.hasOnboarded;

  return (
    <>
      <CheckoutSteps current={0} />
      <div className="max-w-3xl mx-auto mt-10">
        {!hasOnboarded ? (
          <CoordinatorOnboardingForm companyId={coordinator?.businessId} />
        ) : (
          <CoordinatorDashboard coordinator={coordinator} />
        )}
      </div>
      <CoordinatorStats groupedData={groupedData} />

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
                  </div>
                ))}
              </div>
            </div>
          ))}
    </>
  );
}