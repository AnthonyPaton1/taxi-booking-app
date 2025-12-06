// lib/subscriptionHelpers.js

export function getMonthlyRate(tier) {
  const rates = {
    FOUNDING: 99,
    STANDARD: 125,
    PREMIUM: 115,
    PLATINUM: 105,
  };
  return rates[tier] || 125;
}

export function getTierName(tier) {
  const names = {
    FOUNDING: "Founding Driver",
    STANDARD: "Standard",
    PREMIUM: "Premium",
    PLATINUM: "Platinum",
  };
  return names[tier] || "Standard";
}

export function getTierIcon(tier) {
  const icons = {
    FOUNDING: "👑",
    STANDARD: "⭐",
    PREMIUM: "💎",
    PLATINUM: "🏆",
  };
  return icons[tier] || "⭐";
}

export function getDaysUntilNextPayment(subscriptionExpiresAt) {
  if (!subscriptionExpiresAt) return null;
  
  const now = new Date();
  const expiresAt = new Date(subscriptionExpiresAt);
  const diffTime = expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getDaysSinceSubscriptionStart(subscriptionStartDate) {
  if (!subscriptionStartDate) return 0;
  
  const now = new Date();
  const startDate = new Date(subscriptionStartDate);
  const diffTime = now - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getNextTierInfo(currentTier, daysSinceStart) {
  // Founding drivers never upgrade
  if (currentTier === "FOUNDING") return null;
  
  // Platinum is max tier
  if (currentTier === "PLATINUM") return null;
  
  const tiers = [
    { name: "STANDARD", days: 0, price: 125 },
    { name: "PREMIUM", days: 365, price: 115 },
    { name: "PLATINUM", days: 730, price: 105 },
  ];
  
  const currentIndex = tiers.findIndex(t => t.name === currentTier);
  const nextTier = tiers[currentIndex + 1];
  
  if (!nextTier) return null;
  
  const daysUntilUpgrade = nextTier.days - daysSinceStart;
  const progress = (daysSinceStart / nextTier.days) * 100;
  
  return {
    ...nextTier,
    daysUntilUpgrade,
    progress: Math.min(progress, 100),
  };
}

export function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}