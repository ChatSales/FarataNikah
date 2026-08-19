import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Fallback only — used when a transaction's real plan can't be looked up
// (e.g. a plan was deleted between checkout and webhook). Real prices and
// durations always come from the pricing_plans table so admin edits take
// effect immediately, with no deploy, on both the app and the landing page.
export const PREMIUM_PERIOD_DAYS = 30;

export interface PremiumPlan {
  id: string;
  label: string;
  days: number;
  priceFcfa: number;
  originalPriceFcfa: number;
  monthlyEquivalentFcfa: number;
  boosts: number;
  popular: boolean;
  active: boolean;
}

type Client = SupabaseClient<Database>;

function toPremiumPlan(row: Database["public"]["Tables"]["pricing_plans"]["Row"]): PremiumPlan {
  const days = row.duration_days ?? PREMIUM_PERIOD_DAYS;
  return {
    id: row.id,
    label: row.label,
    days,
    priceFcfa: row.price_fcfa,
    originalPriceFcfa: row.original_price_fcfa ?? row.price_fcfa,
    monthlyEquivalentFcfa: Math.round((row.price_fcfa / days) * 30),
    boosts: row.boosts_included,
    popular: row.is_popular,
    active: row.is_active,
  };
}

// For display/checkout — only ever shows plans currently on sale.
export async function getPremiumPlans(supabase: Client): Promise<PremiumPlan[]> {
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("type", "premium")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map(toPremiumPlan);
}

// Deliberately not filtered by is_active: also used by the Moneroo webhook
// to reconcile a transaction that was legitimately created while the plan
// was still active — deactivating a plan later must stop new checkouts,
// not break payments already in flight. Callers that are about to start a
// *new* checkout should check the returned `active` flag themselves.
export async function getPremiumPlan(
  supabase: Client,
  planId: string
): Promise<PremiumPlan | undefined> {
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("id", planId)
    .eq("type", "premium")
    .maybeSingle();
  return data ? toPremiumPlan(data) : undefined;
}

// How long a single boost (from a Premium-included credit) keeps a profile
// pinned to the top of Discover — distinct from the purchasable boost tiers
// in lib/boost-pricing.ts, which have their own explicit durations.
export const BOOST_DURATION_MINUTES = 30;
