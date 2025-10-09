"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/shared/header/managerSteps";
import ManagerDashboard from "@/components/dashboard/business/managerDashboard";
import ManagerOnboardingForm from "@/components/forms/business/managerOnboardingForm";
import { hasManagerAccess } from "@/lib/roles";
import ManagerStats from "@/components/dashboard/business/manager-stats";

export default function ManagerHomePage() {
  const [session, setSession] = useState(null);
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const groupedData = manager?.houses?.reduce((acc, house) => {
  const area = house.area?.label || "Unassigned";
  if (!acc[area]) acc[area] = [];
  acc[area].push(house);
  return acc;
}, {}) || {};

  useEffect(() => {
    const load = async () => {
      const session = await getSession();

      if (!session || !hasManagerAccess(session.user.role)) {
        router.push("/unauthorised");
        return;
      }

      setSession(session);

      try {
        const userRes = await fetch(`/api/user/${session.user.id}`);
        const user = await userRes.json();
        setManager(user);
      } catch (err) {
        console.error("Error fetching manager data:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  const hasOnboarded = manager?.hasOnboarded;

  return (
    <>
      <CheckoutSteps current={0} />
      <div className="max-w-3xl mx-auto mt-10">
        {!hasOnboarded ? (
          <ManagerOnboardingForm companyId={manager?.businessId} />
        ) : (
          <ManagerDashboard manager={manager} />
        )}
      </div>
      {hasOnboarded && (
  <ManagerStats groupedData={groupedData} />
)}

          {Object.entries(groupedData).map(([area, houses]) => (
            <div key={area} className="mb-8">
              <h2 className="text-xl font-bold text-blue-800 mb-4">📍 {area}</h2>
              <div className="space-y-4">
                {houses.map((house) => (
                  <div key={house.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
  <p className="font-semibold text-gray-800">
    🏠 {house.label} — {house.line1}, {house.postcode}
  </p>
  <p className="text-sm text-gray-600">
    Internal ID: {house.internalId} | PIN: {house.pin}
  </p>
  <p className="text-sm text-gray-500 italic">
    Tenants: {house.tenants || "None listed"}
  </p>
</div>
                ))}
              </div>
            </div>
          ))}
    </>
  );
}
