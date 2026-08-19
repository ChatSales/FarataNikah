import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface BoostTier {
  id: string;
  label: string;
  durationLabel: string;
  hours: number;
  priceFcfa: number;
  active: boolean;
}

type Client = SupabaseClient<Database>;

function formatDurationLabel(hours: number): string {
  if (hours % 24 === 0 && hours > 24) return `${hours / 24} jours`;
  if (hours === 24) return "24h";
  return `${hours}h`;
}

function toBoostTier(row: Database["public"]["Tables"]["pricing_plans"]["Row"]): BoostTier {
  const hours = row.duration_hours ?? 24;
  return {
    id: row.id,
    label: row.label,
    durationLabel: formatDurationLabel(hours),
    hours,
    priceFcfa: row.price_fcfa,
    active: row.is_active,
  };
}

// plan_id values are prefixed "boost_" so the Moneroo webhook can tell a
// standalone boost purchase apart from a Premium subscription purchase
// while sharing the same payment_transactions table/flow.
export async function getBoostTiers(supabase: Client): Promise<BoostTier[]> {
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("type", "boost")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map(toBoostTier);
}

// Deliberately not filtered by is_active — see getPremiumPlan's comment;
// same reasoning applies here for webhook reconciliation.
export async function getBoostTier(supabase: Client, id: string): Promise<BoostTier | undefined> {
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("id", id)
    .eq("type", "boost")
    .maybeSingle();
  return data ? toBoostTier(data) : undefined;
}
