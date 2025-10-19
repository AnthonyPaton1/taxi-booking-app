// components/dashboard/business/adminDashboardClient.jsx
"use client";

import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import BusinessOnboardingForm from "@/components/forms/business/BusinessOnboardingForm";
import AdminDashboard from "@/components/dashboard/business/adminDashboard";

export default function AdminDashboardClient({ 
  user, 
  groupedData, 
  hasOnboarded 
}) {
  return (
    <div className="py-10 px-6 max-w-6xl mx-auto space-y-8">
      <CheckoutSteps current={0} />

      {!hasOnboarded ? (
        <BusinessOnboardingForm 
          prefillData={{ 
            name: user?.name, 
            email: user?.email 
          }} 
        />
      ) : (
        <AdminDashboard user={user} groupedData={groupedData} />
      )}
    </div>
  );
}