"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { completeOnboarding } from "@/app/actions/completeOnboarding";
import DriverOnboardingForm from "@/components/forms/DriverOnboardingForm";

export default function DriverOnboardingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await completeOnboarding("DRIVER");

    if (result.success) {
      const from = searchParams.get("from") || "/dashboard/driver";
      router.push(from);
    } else {
      alert("Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div onSubmit={handleSubmit} className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700">Driver Onboarding</h1>
      <p>This is your one-time onboarding form. Please confirm your details.</p>
      <DriverOnboardingForm />
    </div>
  );
}