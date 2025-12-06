// components/dashboard/driver/SubscriptionBadge.jsx

"use client";

import {  Clock, Crown, Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMonthlyRate,
  getTierName,
  getTierIcon,
  getDaysUntilNextPayment,
  getDaysSinceSubscriptionStart,
  getNextTierInfo,
  formatDate,
} from "@/lib/subscriptionHelpers";

export default function SubscriptionBadge({ driver }) {
  const { 
    isSubscribed, 
    subscriptionTier, 
    subscriptionExpiresAt,
    subscriptionStartDate 
  } = driver;

const SUBSCRIPTIONS_ENABLED = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true';

  if (!isSubscribed && !SUBSCRIPTIONS_ENABLED) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Beta Access - Free Until Launch
            </h3>
            <p className="text-sm text-gray-600">
              You're a founding driver! Full platform access during beta phase.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Founding Driver Spots</span>
            <span className="text-2xl font-bold text-purple-600">87 / 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full" 
              style={{width: '13%'}} 
            />
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Lock in <strong>£99/month forever</strong> when subscriptions launch. 
            You'll receive 30 days notice before any fees commence.
          </p>
        </div>
      </div>
    );
  }

 if (!isSubscribed && SUBSCRIPTIONS_ENABLED) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Subscription Required
            </h3>
            <p className="text-sm text-gray-600">
              Subscribe to start bidding on bookings
            </p>
          </div>
        </div>
        <Button 
          asChild
          className="w-full"
          size="lg"
        >
          <a href="/dashboard/driver/subscribe">
            Subscribe Now - From £99/month
          </a>
        </Button>
      </div>
    );
  }

  // SUBSCRIBED STATE (rest of the component stays the same)
  const monthlyRate = getMonthlyRate(subscriptionTier);
  const tierName = getTierName(subscriptionTier);
  const tierIcon = getTierIcon(subscriptionTier);
  const daysUntilPayment = getDaysUntilNextPayment(subscriptionExpiresAt);
  const daysSinceStart = getDaysSinceSubscriptionStart(subscriptionStartDate);
  const nextTierInfo = getNextTierInfo(subscriptionTier, daysSinceStart);


  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl">{tierIcon}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subscription Active</p>
              <p className="text-lg font-bold text-gray-900">
                {tierName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              £{monthlyRate}
            </p>
            <p className="text-sm text-gray-600">/month</p>
          </div>
        </div>
      </div>

      {/* Payment Countdown */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Next Payment
          </span>
          <span className="text-sm text-gray-600">
            {formatDate(subscriptionExpiresAt)}
          </span>
        </div>
        
        {daysUntilPayment !== null && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-2xl font-bold text-blue-600">
                {daysUntilPayment} {daysUntilPayment === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs text-gray-600">
                until next £{monthlyRate} payment
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loyalty Progress (if applicable) */}
      {nextTierInfo && (
        <div className="p-6 border-b">
          <LoyaltyProgress 
            currentTier={subscriptionTier}
            nextTierInfo={nextTierInfo}
            subscriptionStartDate={subscriptionStartDate}
          />
        </div>
      )}

      {/* Founding Driver Special Message */}
      {subscriptionTier === "FOUNDING" && (
        <div className="p-6 bg-purple-50 border-b">
          <div className="flex items-start gap-3">
            <Crown className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-purple-900 mb-1">
                Founding Driver - Lifetime Rate
              </p>
              <p className="text-sm text-purple-700">
                Your £99/month rate is locked forever. You'll never pay more, 
                even as standard pricing increases.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platinum Max Tier Message */}
      {subscriptionTier === "PLATINUM" && (
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
          <div className="flex items-start gap-3">
            <Trophy className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-gray-900 mb-1">
                🎉 Maximum Tier Reached!
              </p>
              <p className="text-sm text-gray-700">
                You're at the lowest rate (£105/month). Thanks for your loyalty!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 bg-gray-50">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => window.open('https://www.paypal.com/myaccount/autopay/', '_blank')}
        >
          Manage Subscription in PayPal
        </Button>
      </div>
    </div>
  );
}

// Loyalty Progress Sub-component
function LoyaltyProgress({ currentTier, nextTierInfo, subscriptionStartDate }) {
  const { name, price, daysUntilUpgrade, progress } = nextTierInfo;
  
  const upgradeDate = new Date(subscriptionStartDate);
  upgradeDate.setDate(upgradeDate.getDate() + nextTierInfo.days);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Next Tier Upgrade
        </span>
        <span className="text-sm font-bold text-purple-600">
          {daysUntilUpgrade} days
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Current: £{getMonthlyRate(currentTier)}/mo
        </span>
        <span className="font-semibold text-purple-700">
          → £{price}/mo
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mt-2">
        Your rate automatically drops to <strong>£{price}/month</strong> on{' '}
        <strong>{formatDate(upgradeDate)}</strong>
      </p>
    </div>
  );
}