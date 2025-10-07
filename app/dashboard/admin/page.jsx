"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import BusinessOnboardingForm from "@/components/forms/business/BusinessOnboardingForm";
import AdminStats from "@/components/dashboard/business/admin-stats";
import { hasAdminAccess } from "@/lib/roles";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
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
        const userRes = await fetch(`/api/user/${session.user.id}`);
        const user = await userRes.json();

        if (!user || !user.adminOfBusiness) {
          setHasOnboarded(false);
        } else {
          setHasOnboarded(user.adminOfBusiness.hasOnboarded ?? false);
        }

        const housesRes = await fetch("/api/admin/houses");
        const data = await housesRes.json();
        setGroupedData(data.grouped || {});
      } catch (err) {
        console.error("Error fetching admin data:", err);
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

      {!hasOnboarded ? (
        <BusinessOnboardingForm />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-blue-800">
                Welcome to the Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Control panel for managing users, drivers, and more.
              </p>
            </div>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
