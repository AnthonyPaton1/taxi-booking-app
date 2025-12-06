// components/dashboard/driver/SubscribeClient.jsx

"use client";

import { useState } from "react";
import { CheckCircle, Zap, Shield, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscribeClient({ driver, availableBookings }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("STANDARD");

  const plans = [
    {
      id: "FOUNDING",
      name: "Founding Driver",
      price: 99,
      description: "Limited time - first 100 drivers only",
      badge: "🎉 Best Value",
      badgeColor: "bg-purple-100 text-purple-800",
      features: [
        "£99/month locked forever",
        "Access to all bookings",
        "Founding Driver badge",
        "Priority support",
        "Exclusive founding driver community",
      ],
      icon: Crown,
      iconColor: "text-purple-600",
      limited: true,
    },
    {
      id: "STANDARD",
      name: "Standard",
      price: 125,
      description: "Full access to platform",
      badge: "Most Popular",
      badgeColor: "bg-blue-100 text-blue-800",
      features: [
        "Access to all bookings",
        "Keep 100% of your fares",
       "Drops to £115 after 12 months",  
      "Drops to £105 after 24 months", 
        "Auto-upgrade to loyalty tiers",
      ],
      icon: Zap,
      iconColor: "text-blue-600",
    },
  ];

  const handleSubscribe = async (planId) => {
    setLoading(true);
    
    try {
      // Call API to create PayPal subscription
      const res = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          driverId: driver.id,
          planType: planId,
        }),
      });

      const data = await res.json();

      if (data.success && data.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      } else {
        alert("Error: " + (data.error || "Failed to create subscription"));
        setLoading(false);
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Subscribe to Start Earning
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {availableBookings} bookings available near you right now.
            Subscribe to start bidding and earning.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Keep 100% of Fares</h3>
            <p className="text-gray-600 text-sm">
              No commission on rides. We charge a flat monthly fee, you keep everything you earn.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Predictable Costs</h3>
            <p className="text-gray-600 text-sm">
              Fixed monthly fee. No surprises. Cancel anytime.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Loyalty Rewards</h3>
            <p className="text-gray-600 text-sm">
              Price drops automatically after 6, 12, and 24 months.
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-xl overflow-hidden border-2 ${
                  selectedPlan === plan.id ? "border-blue-500" : "border-gray-200"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`${plan.badgeColor} text-center py-2 px-4 text-sm font-semibold`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">£{plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Just £{(plan.price / 30).toFixed(2)}/day
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || (plan.limited && plan.id === "FOUNDING")}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Processing..." : `Subscribe for £${plan.price}/month`}
                  </Button>

                  {plan.limited && (
                    <p className="text-xs text-center text-gray-500 mt-3">
                      Limited to first 100 drivers
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ / Reassurance */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes. Cancel through your PayPal account anytime. No cancellation fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Do you take commission on rides?</h3>
              <p className="text-gray-600">
                No. We charge a flat monthly subscription. You keep 100% of your fares.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">What are loyalty tiers?</h3>
              <p className="text-gray-600">
                Your subscription price automatically drops after 6, 12, and 24 months.
                Long-term drivers save up to £25/month.
              </p>
            </div>
           <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-md border-2 border-purple-200">
  <div className="flex items-start gap-3">
    <Crown className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
        🎉 Founding Driver Offer
        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
          Limited
        </span>
      </h3>
      <p className="text-gray-700 mb-2">
        The first <strong>100 drivers</strong> to subscribe will lock in <strong>£99/month forever</strong> – no matter how much prices increase in future.
      </p>
      <p className="text-sm text-purple-700 font-semibold">
        🔒 Lifetime rate guarantee • Priority support • Founding Driver badge
      </p>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}