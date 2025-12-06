// app/api/paypal/create-subscription/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

// PayPal API Base URL
const PAYPAL_API = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// Get PayPal Access Token
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { driverId, planType } = await request.json();

    // Verify driver belongs to this user
    const driver = await prisma.driver.findUnique({
      where: { 
        id: driverId,
        userId: session.user.id 
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if already subscribed
    if (driver.isSubscribed) {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 400 }
      );
    }

    // Get the appropriate Plan ID from env
   const planIds = {
  FOUNDING: process.env.PAYPAL_PLAN_FOUNDING,    // £99 - locked forever
  STANDARD: process.env.PAYPAL_PLAN_STANDARD,    // £125 - new drivers
  PREMIUM: process.env.PAYPAL_PLAN_PREMIUM,      // £115 - 12 months 
  PLATINUM: process.env.PAYPAL_PLAN_PLATINUM,    // £105 - 24+ months
};

    const planId = planIds[planType];

    if (!planId) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    console.log("🔍 Debug Info:");
console.log("  Plan Type:", planType);
console.log("  Plan ID:", planId);
console.log("  PayPal Mode:", process.env.PAYPAL_MODE);
console.log("  API Base:", PAYPAL_API);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create subscription with PayPal
    const subscriptionResponse = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: "NEAT Transport",
          locale: "en-GB",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/driver/subscription-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/driver/subscription-cancelled`,
        },
        custom_id: driverId, // Store driver ID for webhook
      }),
    });

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error("PayPal error:", subscriptionData);
      return NextResponse.json(
        { error: "Failed to create subscription with PayPal" },
        { status: 500 }
      );
    }

    // Get approval URL (redirect user to PayPal)
    const approvalUrl = subscriptionData.links.find(
      (link) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      return NextResponse.json(
        { error: "No approval URL from PayPal" },
        { status: 500 }
      );
    }

    // Store pending subscription info (will be confirmed by webhook)
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        paypalSubscriptionId: subscriptionData.id,
        paypalPlanId: planId,
        subscriptionTier: planType,
      },
    });

    return NextResponse.json({
      success: true,
      approvalUrl,
      subscriptionId: subscriptionData.id,
    });

  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}