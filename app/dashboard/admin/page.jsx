"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import BusinessOnboardingForm from "@/components/forms/business/BusinessOnboardingForm";
import AdminDashboard from "@/components/dashboard/business/adminDashboard";
import { hasAdminAccess } from "@/lib/roles";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  if (!userRes.ok) {
    const text = await userRes.text(); // Read body only if not OK
    console.error("Error response text:", text);
    throw new Error(`Failed to fetch user. Status: ${userRes.status}`);
  }

  const user = await userRes.json(); // Only called if response is OK
  setUser(user);
  setHasOnboarded(user.adminOfBusiness?.hasOnboarded ?? false);

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

 

if (!user) return <div className="p-6">User not found</div>;

if (loading) return <div className="p-6">Loading...</div>;

return (
  <div className="py-10 px-6 max-w-6xl mx-auto space-y-8">
    <CheckoutSteps current={0} />

    {!hasOnboarded ? (
      <BusinessOnboardingForm prefillData={{ name: user?.name, email: user?.email }} />
    ) : (
      <AdminDashboard groupedData={groupedData} />
    )}
  </div>
);
}
