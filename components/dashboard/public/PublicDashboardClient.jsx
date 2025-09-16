"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import PublicDashboardLayout from "./public-dashboard"; // your actual dashboard UI

export default function PublicDashboardClient({ user }) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const router = useRouter();
  useEffect(() => {
    if (success === "true") {
      toast.success("Booking submitted! Awaiting bids...");

      const timeout = setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        params.delete("success");
        router.replace(`/dashboard/public?${params.toString()}`, {
          scroll: false,
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [success]);

  return <PublicDashboardLayout user={user} />;
}
