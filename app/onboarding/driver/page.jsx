'use client'

import dynamic from "next/dynamic";

// Dynamically import the client-only component
const DriverOnboardingClient = dynamic(
  () => import("@/components/onboarding/DriverOnboardingClient"),
  { ssr: false } // 🚫 disables SSR for this dynamic client component
);

export default function DriverOnboardingPage() {
  return <DriverOnboardingClient />;
}