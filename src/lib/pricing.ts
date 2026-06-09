export type PlanTier = "studio-lite" | "studio-pro";

export interface AddOn {
  id: string;
  name: string;
  description: string;
  pricePerMonth: number;
}

export interface Plan {
  id: PlanTier;
  name: string;
  tagline: string;
  pricePerRooftop: number;
  pricePerVin: number;
  maxVins: number;
  color: string;
  recommended?: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "studio-lite",
    name: "Studio Lite",
    tagline: "Perfect for growing dealerships",
    pricePerRooftop: 199,
    pricePerVin: 3.98,
    maxVins: 50,
    color: "#6366f1",
    features: [
      "AI background removal",
      "Basic analytics dashboard",
      "Email support",
    ],
  },
  {
    id: "studio-pro",
    name: "Studio Pro",
    tagline: "For high-volume dealerships",
    pricePerRooftop: 349,
    pricePerVin: 3.49,
    maxVins: 200,
    color: "#8b5cf6",
    recommended: true,
    features: [
      "Everything in Studio Lite",
      "Priority AI processing",
      "Advanced analytics + ROI tracking",
      "Dedicated account manager",
      "Custom backgrounds",
    ],
  },
];

export const ADD_ONS: AddOn[] = [
  {
    id: "smartmatch-new",
    name: "SmartMatch New",
    description: "AI-powered matching for new car inventory",
    pricePerMonth: 99,
  },
  {
    id: "smartmatch-old",
    name: "SmartMatch Pre-owned",
    description: "AI-powered matching for pre-owned inventory",
    pricePerMonth: 99,
  },
  {
    id: "smartcampaigns",
    name: "SmartCampaigns",
    description: "Automated ad campaigns across channels",
    pricePerMonth: 149,
  },
  {
    id: "360-spin",
    name: "360° Spin",
    description: "Interactive 360-degree vehicle walkaround",
    pricePerMonth: 79,
  },
  {
    id: "video-studio",
    name: "Video Studio",
    description: "Automated listing videos for every VIN",
    pricePerMonth: 129,
  },
];

export interface PricingState {
  plan: PlanTier;
  vins: number;
  addOns: Set<string>;
}

export function calculatePricing(state: PricingState) {
  const plan = PLANS.find((p) => p.id === state.plan)!;
  const baseMonthly = plan.pricePerRooftop + plan.pricePerVin * state.vins;

  let addOnTotal = 0;
  const addOnBreakdown: { name: string; price: number }[] = [];

  for (const addonId of state.addOns) {
    const addon = ADD_ONS.find((a) => a.id === addonId);
    if (!addon) continue;
    addOnTotal += addon.pricePerMonth;
    addOnBreakdown.push({ name: addon.name, price: addon.pricePerMonth });
  }

  const monthlyTotal = baseMonthly + addOnTotal;
  const blendedPerVin = state.vins > 0 ? monthlyTotal / state.vins : 0;

  return {
    plan,
    basePlan: plan.pricePerRooftop,
    vinCost: plan.pricePerVin * state.vins,
    addOnTotal,
    addOnBreakdown,
    monthlyTotal,
    blendedPerVin,
    annualTotal: monthlyTotal * 12,
  };
}

export function getAIInsight(state: PricingState): string {
  const pricing = calculatePricing(state);
  const { vins, plan, addOns } = state;

  if (vins === 0) return "Enter your VIN count to see personalized insights.";

  if (plan === "studio-lite" && vins > 40) {
    return `At ${vins} VINs, upgrading to Studio Pro saves ~$${Math.round(
      (pricing.blendedPerVin - 3.49) * vins
    )}/mo with a lower per-VIN rate.`;
  }

  if (addOns.has("smartmatch-new") && addOns.has("smartmatch-old")) {
    return `Both SmartMatch tiers add $198/mo. At ${vins} VINs your blended rate is $${pricing.blendedPerVin.toFixed(2)}/VIN.`;
  }

  if (pricing.blendedPerVin < 5) {
    return `Excellent blended rate of $${pricing.blendedPerVin.toFixed(
      2
    )}/VIN — you're maximising value at your current volume.`;
  }

  return `Your monthly investment of $${Math.round(
    pricing.monthlyTotal
  )} works out to $${pricing.blendedPerVin.toFixed(2)}/VIN. Adding more VINs reduces your per-unit cost.`;
}
