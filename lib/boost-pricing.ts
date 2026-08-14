export interface BoostTier {
  id: string;
  label: string;
  durationLabel: string;
  hours: number;
  priceFcfa: number;
}

// plan_id values are prefixed "boost_" so the Moneroo webhook can tell a
// standalone boost purchase apart from a Premium subscription purchase
// while sharing the same payment_transactions table/flow.
export const BOOST_TIERS: BoostTier[] = [
  { id: "boost_24h", label: "Boost 24h", durationLabel: "24h", hours: 24, priceFcfa: 1500 },
  { id: "boost_3d", label: "Boost 3 jours", durationLabel: "3 jours", hours: 72, priceFcfa: 3000 },
  { id: "boost_7d", label: "Boost 7 jours", durationLabel: "7 jours", hours: 168, priceFcfa: 5000 },
];

export function getBoostTier(id: string): BoostTier | undefined {
  return BOOST_TIERS.find((t) => t.id === id);
}
