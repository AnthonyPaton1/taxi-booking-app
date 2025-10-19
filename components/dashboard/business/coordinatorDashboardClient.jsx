// components/dashboard/business/coordinatorDashboardClient.jsx
"use client";

import CheckoutSteps from "@/components/shared/header/coordinatorSteps";
import CoordinatorDashboard from "./coordinatorDashboard";
import CoordinatorOnboardingForm from "@/components/forms/business/coordinatorOnboardingForm";
import CoordinatorStats from "@/components/dashboard/business/coordinator-stats";

export default function CoordinatorDashboardClient({ 
  coordinator, 
  groupedData, 
  hasOnboarded 
}) {
 

  // ✅ Use explicit false check
  const shouldShowOnboarding = hasOnboarded === false;

  return (
    <>
      <CheckoutSteps current={0} />
      <div className="max-w-3xl mx-auto mt-10">
        {shouldShowOnboarding ? (
          <>
            
            <CoordinatorOnboardingForm companyId={coordinator?.businessId} />
          </>
        ) : (
          <>
            
            <CoordinatorDashboard coordinator={coordinator} groupedData={groupedData} />
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
        )}
      </div>
    </>
  );
}