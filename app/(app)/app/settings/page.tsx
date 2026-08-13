import { redirect } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, is_premium, premium_until")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
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
