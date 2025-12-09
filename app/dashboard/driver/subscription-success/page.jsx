// app/dashboard/driver/subscription-success/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubscriptionSuccessPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DRIVER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Activated! 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription is being processed. You'll be able to start bidding on bookings within a few minutes.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Next steps:</strong>
            <br />
            Check your email for payment confirmation from PayPal.
            Your subscription will appear on your dashboard shortly.
          </p>
        </div>

        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard/driver">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}