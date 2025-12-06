// app/dashboard/driver/subscription-cancelled/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubscriptionCancelledPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-orange-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Cancelled
        </h1>

        <p className="text-gray-600 mb-6">
          You cancelled the subscription process. No charges have been made.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          You can subscribe anytime to start bidding on bookings.
        </p>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard/driver/subscribe">
              Try Again
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard/driver">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}