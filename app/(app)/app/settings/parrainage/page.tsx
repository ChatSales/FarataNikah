import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, Rocket, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReferralLinkCard } from "@/components/settings/referral-link-card";

export default async function ReferralPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, referral_code")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");

  // Counting referred profiles regardless of their own verification status
  // needs to bypass RLS (profiles_select_approved only exposes approved
  // rows) — this is a read-only stats query, no identity data leaks.
  const admin = createAdminClient();
  const [{ count: totalInvited }, { count: rewarded }] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", profile.id),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", profile.id)
      .eq("referral_reward_claimed", true),
  ]);

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${profile.referral_code}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/app/settings"
          aria-label="Retour aux paramètres"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
          <Gift className="h-5 w-5 text-gold-500" /> Parrainage
        </h1>
      </div>
      <p className="mt-2 text-sm text-primary-900/60">
        Invite tes proches — dès qu&apos;un profil que tu as invité est validé,
        tu reçois un boost gratuit.
      </p>

      <div className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <p className="text-sm font-medium text-primary-900">Ton lien de parrainage</p>
        <div className="mt-3">
          <ReferralLinkCard link={link} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-primary-100 bg-cream-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <UserPlus className="h-4.5 w-4.5" />
          </span>
          <p className="mt-2 text-2xl font-bold text-primary-900">{totalInvited ?? 0}</p>
          <p className="text-xs text-primary-900/55">Invitation{(totalInvited ?? 0) > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-gold-700">
            <Rocket className="h-4.5 w-4.5" />
          </span>
          <p className="mt-2 text-2xl font-bold text-primary-900">{rewarded ?? 0}</p>
          <p className="text-xs text-primary-900/55">Boost{(rewarded ?? 0) > 1 ? "s" : ""} reçu{(rewarded ?? 0) > 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
}
