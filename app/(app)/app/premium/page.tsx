import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Crown, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { BoostPanel } from "@/components/settings/boost-panel";
import { AdminPlanToggle } from "@/components/settings/admin-plan-toggle";
import { MetaPixelEvent } from "@/components/analytics/meta-pixel-event";
import { getPremiumPlans } from "@/lib/premium";
import { getBoostTiers } from "@/lib/boost-pricing";

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium, premium_until, boost_credits, boosted_until")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const [premiumPlans, boostTiers] = await Promise.all([
    getPremiumPlans(supabase),
    getBoostTiers(supabase),
  ]);

  let purchasedAmount: number | null = null;
  let purchaseEventId: string | null = null;
  // Meta's Purchase event tracks the free -> Premium conversion specifically
  // — Boost top-ups aren't the ad-campaign goal, so they're deliberately
  // excluded here (and in the webhook's server-side leg).
  let isPremiumPurchase = false;
  if (checkout === "return") {
    const { data: lastTransaction } = await supabase
      .from("payment_transactions")
      .select("id, amount_fcfa, status, plan_id")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    purchasedAmount =
      lastTransaction?.amount_fcfa ??
      premiumPlans.find((p) => p.popular)?.priceFcfa ??
      premiumPlans[0]?.priceFcfa ??
      0;
    purchaseEventId = lastTransaction?.id ?? null;

    if (lastTransaction?.plan_id) {
      const { data: planRow } = await supabase
        .from("pricing_plans")
        .select("type")
        .eq("id", lastTransaction.plan_id)
        .maybeSingle();
      isPremiumPurchase = planRow?.type === "premium";
    }
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = Boolean(adminRow);

  const featuredPlan = premiumPlans.find((p) => p.popular) ?? premiumPlans[0];
  const discountPercent = featuredPlan
    ? Math.round((1 - featuredPlan.priceFcfa / featuredPlan.originalPriceFcfa) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {checkout === "return" && isPremiumPurchase && purchasedAmount !== null && (
        <MetaPixelEvent
          event="Purchase"
          params={{ value: purchasedAmount, currency: "XOF" }}
          eventId={purchaseEventId ?? undefined}
        />
      )}

      <div className="flex items-center gap-3">
        <Link
          href="/app/settings"
          aria-label="Retour aux paramètres"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-primary-900">Premium & Boost</h1>
      </div>
      <p className="mt-2 text-sm text-primary-900/60">
        Débloque plus de visibilité et de fonctionnalités.
      </p>

      <section className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          <Crown className="h-4 w-4 text-gold-500" /> Mon abonnement
        </h2>

        {profile.is_premium ? (
          <div className="mt-3">
            <p className="flex items-center gap-2 text-sm font-medium text-primary-900">
              <CheckCircle2 className="h-4 w-4 text-primary-600" /> FarataNikah Premium actif
            </p>
            {profile.premium_until && (
              <p className="mt-1 text-sm text-primary-900/60">
                Renouvellement le{" "}
                {new Date(profile.premium_until).toLocaleDateString("fr-FR")}
                {subscription?.cancel_at_period_end && " (ne se renouvellera pas)"}
              </p>
            )}
          </div>
        ) : premiumPlans.length === 0 ? (
          <p className="mt-3 text-sm text-primary-900/70">
            Aucune offre Premium n&apos;est disponible pour le moment.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-primary-900/70">
              Tu es actuellement sur le plan gratuit.
              {subscription?.status === "expired" &&
                " Ton abonnement Premium précédent a expiré."}
            </p>
            {featuredPlan && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary-900 px-4 py-3.5 text-cream-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-primary-900">
                  <Crown className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    Passe Premium
                    <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-primary-900">
                      -{discountPercent}%
                    </span>
                  </p>
                  <p className="text-xs text-cream-50/70">
                    Demandes illimitées, profil mis en avant, badge Premium
                  </p>
                </div>
              </div>
            )}
            <div className="mt-4">
              <UpgradeButton plans={premiumPlans} />
            </div>
          </>
        )}
      </section>

      {isAdmin && <AdminPlanToggle isPremium={profile.is_premium} />}

      <section className="mt-6 rounded-2xl border border-gold-200 bg-gold-50/60 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-700">
          <Rocket className="h-4 w-4" /> Boost
        </h2>
        <div className="mt-3">
          <BoostPanel
            boostCredits={profile.boost_credits}
            boostedUntil={profile.boosted_until}
            tiers={boostTiers}
          />
        </div>
      </section>
    </div>
  );
}
