// app/api/webhooks/paypal/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// PayPal webhook event types we care about
const WEBHOOK_EVENTS = {
  ACTIVATED: "BILLING.SUBSCRIPTION.ACTIVATED",
  UPDATED: "BILLING.SUBSCRIPTION.UPDATED",
  CANCELLED: "BILLING.SUBSCRIPTION.CANCELLED",
  SUSPENDED: "BILLING.SUBSCRIPTION.SUSPENDED",
  EXPIRED: "BILLING.SUBSCRIPTION.EXPIRED",
  PAYMENT_COMPLETED: "PAYMENT.SALE.COMPLETED",
  PAYMENT_FAILED: "PAYMENT.SALE.DENIED",
};

// Verify webhook signature (security)
async function verifyWebhookSignature(req) {
  // PayPal sends signature headers for verification
  const transmissionId = req.headers.get("paypal-transmission-id");
  const transmissionTime = req.headers.get("paypal-transmission-time");
  const certUrl = req.headers.get("paypal-cert-url");
  const transmissionSig = req.headers.get("paypal-transmission-sig");
  const authAlgo = req.headers.get("paypal-auth-algo");

  // For now, we'll skip signature verification in sandbox
  // In production, you MUST verify signatures
  if (process.env.PAYPAL_MODE === "sandbox") {
    return true;
  }

  // TODO: Implement full signature verification for production
  return true;
}

export async function POST(request) {
  try {
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log("📨 PayPal Webhook received:", eventType);
    console.log("Resource:", JSON.stringify(resource, null, 2));

    // Handle different webhook events
    switch (eventType) {
      case WEBHOOK_EVENTS.ACTIVATED:
        await handleSubscriptionActivated(resource);
        break;

      case WEBHOOK_EVENTS.UPDATED:
        await handleSubscriptionUpdated(resource);
        break;

      case WEBHOOK_EVENTS.CANCELLED:
        await handleSubscriptionCancelled(resource);
        break;

      case WEBHOOK_EVENTS.SUSPENDED:
        await handleSubscriptionSuspended(resource);
        break;

      case WEBHOOK_EVENTS.EXPIRED:
        await handleSubscriptionExpired(resource);
        break;

      case WEBHOOK_EVENTS.PAYMENT_COMPLETED:
        await handlePaymentCompleted(resource);
        break;

      case WEBHOOK_EVENTS.PAYMENT_FAILED:
        await handlePaymentFailed(resource);
        break;

      default:
        console.log("Unhandled webhook event:", eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Subscription activated (first payment succeeded)
async function handleSubscriptionActivated(resource) {
  const subscriptionId = resource.id;
  const planId = resource.plan_id;
  const customId = resource.custom_id; // This is the driverId we passed

  console.log("✅ Subscription activated:", subscriptionId);

  // Find driver by subscription ID
  const driver = await prisma.driver.findFirst({
    where: {
      OR: [
        { paypalSubscriptionId: subscriptionId },
        { id: customId }, // Fallback to custom_id
      ],
    },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", subscriptionId);
    return;
  }

  // Calculate next billing date (30 days from now)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  // Update driver to active subscription
  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      isSubscribed: true,
      subscriptionStartDate: new Date(),
      subscriptionExpiresAt: nextBillingDate,
      lastPaymentDate: new Date(),
      paypalSubscriptionId: subscriptionId,
      paypalPlanId: planId,
    },
  });

  console.log("✅ Driver subscription activated:", driver.id);

  // TODO: Send welcome email to driver
}

// Subscription updated (plan changed)
async function handleSubscriptionUpdated(resource) {
  const subscriptionId = resource.id;
  const planId = resource.plan_id;

  console.log("🔄 Subscription updated:", subscriptionId);

  const driver = await prisma.driver.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", subscriptionId);
    return;
  }

  // Determine tier from plan ID
  let tier = "STANDARD";
  if (planId === process.env.PAYPAL_PLAN_FOUNDING) tier = "FOUNDING";
  else if (planId === process.env.PAYPAL_PLAN_PREMIUM) tier = "PREMIUM";
  else if (planId === process.env.PAYPAL_PLAN_PLATINUM) tier = "PLATINUM";

  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      paypalPlanId: planId,
      subscriptionTier: tier,
    },
  });

  console.log("✅ Driver plan updated:", driver.id, "->", tier);
}

// Subscription cancelled by user
async function handleSubscriptionCancelled(resource) {
  const subscriptionId = resource.id;

  console.log("❌ Subscription cancelled:", subscriptionId);

  const driver = await prisma.driver.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", subscriptionId);
    return;
  }

  // Keep access until current billing period ends
  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      isSubscribed: false,
      // Keep subscriptionExpiresAt - they have access until then
    },
  });

  console.log("✅ Driver subscription cancelled:", driver.id);

  // TODO: Send cancellation confirmation email
}

// Subscription suspended (payment failed)
async function handleSubscriptionSuspended(resource) {
  const subscriptionId = resource.id;

  console.log("⚠️ Subscription suspended:", subscriptionId);

  const driver = await prisma.driver.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", subscriptionId);
    return;
  }

  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      isSubscribed: false,
    },
  });

  console.log("✅ Driver subscription suspended:", driver.id);

  
}

// Subscription expired
async function handleSubscriptionExpired(resource) {
  const subscriptionId = resource.id;

  console.log("🔚 Subscription expired:", subscriptionId);

  const driver = await prisma.driver.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", subscriptionId);
    return;
  }

  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      isSubscribed: false,
    },
  });

  console.log("✅ Driver subscription expired:", driver.id);
}

// Payment completed (recurring payment)
async function handlePaymentCompleted(resource) {
  // PayPal sends this on each successful recurring payment
  const billingAgreementId = resource.billing_agreement_id;

  console.log("💰 Payment completed for subscription:", billingAgreementId);

  const driver = await prisma.driver.findFirst({
    where: { paypalSubscriptionId: billingAgreementId },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", billingAgreementId);
    return;
  }

  // Extend subscription by 30 days
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      lastPaymentDate: new Date(),
      subscriptionExpiresAt: nextBillingDate,
      isSubscribed: true, // Ensure still active
    },
  });

  console.log("✅ Driver payment processed:", driver.id);
}

// Payment failed
async function handlePaymentFailed(resource) {
  const billingAgreementId = resource.billing_agreement_id;

  console.log("❌ Payment failed for subscription:", billingAgreementId);

  const driver = await prisma.driver.findFirst({
    where: { paypalSubscriptionId: billingAgreementId },
  });

  if (!driver) {
    console.error("Driver not found for subscription:", billingAgreementId);
    return;
  }

  // Grace period: Don't immediately suspend
  // PayPal will retry payment, we'll get another webhook

  console.log("⚠️ Payment failed for driver:", driver.id);

  // TODO: Send payment failure warning email
}