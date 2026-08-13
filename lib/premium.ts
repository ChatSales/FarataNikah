// Matches the pricing shown on the marketing page and components/marketing/pricing.tsx.
export const PREMIUM_MONTHLY_PRICE_FCFA = 5900;
export const PREMIUM_PERIOD_DAYS = 30;

export interface PremiumPlan {
  id: string;
  label: string;
  days: number;
  priceFcfa: number;
  originalPriceFcfa: number;
  monthlyEquivalentFcfa: number;
  boosts: number;
  popular?: boolean;
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "15days",
    label: "Premium 15 Jours",
    days: 15,
    priceFcfa: 3900,
    originalPriceFcfa: 7800,
    monthlyEquivalentFcfa: 7800,
    boosts: 1,
  },
  {
    id: "1month",
    label: "Premium 1 Mois",
    days: 30,
    priceFcfa: PREMIUM_MONTHLY_PRICE_FCFA,
    originalPriceFcfa: 9900,
    monthlyEquivalentFcfa: PREMIUM_MONTHLY_PRICE_FCFA,
    boosts: 3,
    popular: true,
  },
  {
    id: "3months",
    label: "Premium 3 Mois",
    days: 90,
    priceFcfa: 9900,
    originalPriceFcfa: 14700,
    monthlyEquivalentFcfa: 3300,
    boosts: 3,
  },
  {
    id: "6months",
    label: "Premium 6 Mois",
    days: 180,
    priceFcfa: 14900,
    originalPriceFcfa: 29400,
    monthlyEquivalentFcfa: 2483,
    boosts: 6,
  },
];

export function getPremiumPlan(planId: string): PremiumPlan | undefined {
  return PREMIUM_PLANS.find((p) => p.id === planId);
}

// How long a single boost keeps a profile pinned to the top of Discover.
export const BOOST_DURATION_MINUTES = 30;
