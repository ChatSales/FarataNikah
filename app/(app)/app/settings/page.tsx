import { redirect } from "next/navigation";
import { CheckCircle2, Mail, Ban, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { UnblockButton } from "@/components/settings/unblock-button";
import { BoostPanel } from "@/components/settings/boost-panel";
import { AdminPlanToggle } from "@/components/settings/admin-plan-toggle";
import { MetaPixelEvent } from "@/components/analytics/meta-pixel-event";
import { PREMIUM_MONTHLY_PRICE_FCFA } from "@/lib/premium";

export default async function SettingsPage({
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
    .select(
      "id, email, first_name, is_premium, premium_until, boost_credits, boosted_until"
    )
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = Boolean(adminRow);

  let purchasedAmount: number | null = null;
  let purchaseEventId: string | null = null;
  if (checkout === "return") {
    const { data: lastTransaction } = await supabase
      .from("payment_transactions")
      .select("id, amount_fcfa, status")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    purchasedAmount = lastTransaction?.amount_fcfa ?? PREMIUM_MONTHLY_PRICE_FCFA;
    // Shared with the server-side Conversions API call the Moneroo webhook
    // fires for this same transaction (lib/meta-capi.ts) — same event_id on
    // both legs so Meta de-duplicates instead of double-counting.
    purchaseEventId = lastTransaction?.id ?? null;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: blocks } = await supabase
    .from("blocked_profiles")
    .select("id, blocked_profile_id")
    .eq("blocker_profile_id", profile.id);

  const blockedIds = (blocks ?? []).map((b) => b.blocked_profile_id);
  const { data: blockedProfiles } = blockedIds.length
    ? await supabase.from("profiles").select("id, first_name").in("id", blockedIds)
    : { data: [] };
  const blockedNameById = new Map((blockedProfiles ?? []).map((p) => [p.id, p.first_name]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {checkout === "return" && purchasedAmount !== null && (
        <MetaPixelEvent
          event="Purchase"
          params={{ value: purchasedAmount, currency: "XOF" }}
          eventId={purchaseEventId ?? undefined}
        />
      )}
      <h1 className="text-2xl font-semibold text-primary-900">Paramètres</h1>

      <section className="mt-8 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Compte
        </h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-primary-900">
          <Mail className="h-4 w-4 text-primary-500" /> {profile.email}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Abonnement
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
        ) : (
          <div className="mt-3">
            <p className="text-sm text-primary-900/70">
              Tu es actuellement sur le plan gratuit.
              {subscription?.status === "expired" &&
                " Ton abonnement Premium précédent a expiré."}
            </p>
            <div className="mt-4">
              <UpgradeButton />
            </div>
          </div>
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
          />
        </div>
      </section>

      {blocks && blocks.length > 0 && (
        <section className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            <Ban className="h-4 w-4" /> Profils bloqués
          </h2>
          <ul className="mt-3 space-y-2">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-primary-100 px-3.5 py-2.5"
              >
                <span className="text-sm text-primary-900">
                  {blockedNameById.get(b.blocked_profile_id) ?? "Profil"}
                </span>
                <UnblockButton profileId={b.blocked_profile_id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-red-100 bg-cream-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700/80">
          Zone de danger
        </h2>
        <div className="mt-3">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
