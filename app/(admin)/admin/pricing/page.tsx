import { redirect } from "next/navigation";
import { DollarSign, Crown, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PricingPlanForm } from "@/components/admin/pricing-plan-form";

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) redirect("/app/home");

  const { data: plans } = await supabase
    .from("pricing_plans")
    .select("*")
    .order("type")
    .order("sort_order");

  const premiumPlans = (plans ?? []).filter((p) => p.type === "premium");
  const boostTiers = (plans ?? []).filter((p) => p.type === "boost");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
        <DollarSign className="h-6 w-6 text-primary-700" /> Tarifs
      </h1>
      <p className="mt-1 text-sm text-primary-900/60">
        Change un prix ici et il s&apos;applique immédiatement sur la landing page et dans
        l&apos;application — aucun redéploiement nécessaire.
      </p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-700">
          <Crown className="h-4 w-4" /> Abonnements Premium
        </h2>
        {premiumPlans.length === 0 ? (
          <p className="mt-4 text-sm text-primary-900/50">Aucune offre Premium configurée.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {premiumPlans.map((plan) => (
              <PricingPlanForm key={plan.id} plan={plan} showPopularToggle />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-700">
          <Rocket className="h-4 w-4" /> Boosts de visibilité
        </h2>
        {boostTiers.length === 0 ? (
          <p className="mt-4 text-sm text-primary-900/50">Aucun palier de boost configuré.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {boostTiers.map((plan) => (
              <PricingPlanForm key={plan.id} plan={plan} showPopularToggle={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
