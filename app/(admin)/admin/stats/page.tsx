import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Clock3,
  Sparkles,
  MessageCircle,
  ShieldAlert,
  UserPlus,
  Wallet,
  TrendingUp,
  Rocket,
  Globe2,
} from "lucide-react";
import { MiniBarChart, DistributionBars } from "@/components/admin/mini-bar-chart";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shortDayLabel(key: string): string {
  const d = new Date(key + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

function bucketByDay(dates: string[], days: string[]): { label: string; value: number }[] {
  const counts = new Map(days.map((d) => [d, 0]));
  for (const iso of dates) {
    const key = iso.slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return days.map((d) => ({ label: shortDayLabel(d), value: counts.get(d) ?? 0 }));
}

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: approvedProfiles },
    { count: pendingVerifications },
    { count: rejectedProfiles },
    { count: premiumMembers },
    { count: newSignupsThisWeek },
    { count: totalMessages },
    { count: pendingFlags },
    { count: pendingReports },
    { count: activeBoosts },
    { data: signupsLast30 },
    { data: messagesLast14 },
    { data: succeededPayments },
    { data: countryRows },
    { data: genderRows },
    { data: madhhabRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "approved"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "rejected"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("moderation_flags").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("profile_reports").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gt("boosted_until", new Date().toISOString()),
    supabase.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("messages")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()),
    supabase.from("payment_transactions").select("amount_fcfa, created_at, plan_id").eq("status", "succeeded"),
    supabase.from("profiles").select("country").eq("verification_status", "approved"),
    supabase.from("profiles").select("gender").eq("verification_status", "approved"),
    supabase.from("profiles").select("madhhab").eq("verification_status", "approved"),
  ]);

  const cards = [
    { label: "Profils approuvés", value: approvedProfiles ?? 0, icon: Users },
    { label: "Vérifications en attente", value: pendingVerifications ?? 0, icon: Clock3 },
    { label: "Profils rejetés", value: rejectedProfiles ?? 0, icon: Users },
    { label: "Membres Premium", value: premiumMembers ?? 0, icon: Sparkles },
    { label: "Nouvelles inscriptions (7j)", value: newSignupsThisWeek ?? 0, icon: UserPlus },
    { label: "Messages envoyés (total)", value: totalMessages ?? 0, icon: MessageCircle },
    { label: "Signalements messages en attente", value: pendingFlags ?? 0, icon: ShieldAlert },
    { label: "Signalements profils en attente", value: pendingReports ?? 0, icon: ShieldAlert },
    { label: "Boosts actifs en ce moment", value: activeBoosts ?? 0, icon: Rocket },
  ];

  const days30 = lastNDayKeys(30);
  const days14 = lastNDayKeys(14);
  const signupsChart = bucketByDay((signupsLast30 ?? []).map((r) => r.created_at), days30);
  const messagesChart = bucketByDay((messagesLast14 ?? []).map((r) => r.created_at), days14);

  const totalRevenue = (succeededPayments ?? []).reduce((s, p) => s + p.amount_fcfa, 0);
  const revenueByPlan = new Map<string, number>();
  for (const p of succeededPayments ?? []) {
    const key = p.plan_id ?? "1month";
    revenueByPlan.set(key, (revenueByPlan.get(key) ?? 0) + p.amount_fcfa);
  }
  const planLabels: Record<string, string> = {
    "15days": "15 jours",
    "1month": "1 mois",
    "3months": "3 mois",
    "6months": "6 mois",
  };
  const revenueByPlanData = Array.from(revenueByPlan.entries())
    .map(([id, value]) => ({ label: planLabels[id] ?? id, value }))
    .sort((a, b) => b.value - a.value);

  const premiumConversionRate = approvedProfiles
    ? Math.round(((premiumMembers ?? 0) / approvedProfiles) * 100)
    : 0;

  function topCounts(rows: { [key: string]: string | null }[] | null, field: string, limit: number) {
    const counts = new Map<string, number>();
    for (const r of rows ?? []) {
      const v = r[field];
      if (!v) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  const countryData = topCounts(countryRows, "country", 8);
  const genderData = topCounts(genderRows, "gender", 2).map((d) => ({
    ...d,
    label: d.label === "male" ? "Hommes" : "Femmes",
  }));
  const madhhabLabels: Record<string, string> = {
    hanafi: "Hanafite",
    maliki: "Malikite",
    shafii: "Chaféite",
    hanbali: "Hanbalite",
    no_preference: "Peu importe",
    other: "Autre",
  };
  const madhhabData = topCounts(madhhabRows, "madhhab", 6).map((d) => ({
    ...d,
    label: madhhabLabels[d.label] ?? d.label,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">Statistiques</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-2xl border border-primary-100 bg-cream-50 p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <c.icon className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-primary-900">{c.value}</p>
              <p className="text-xs text-primary-900/60">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            <TrendingUp className="h-4 w-4" /> Inscriptions — 30 derniers jours
          </h2>
          <div className="mt-4">
            <MiniBarChart data={signupsChart} />
          </div>
        </section>

        <section className="rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            <MessageCircle className="h-4 w-4" /> Messages — 14 derniers jours
          </h2>
          <div className="mt-4">
            <MiniBarChart data={messagesChart} />
          </div>
        </section>

        <section className="rounded-2xl border border-gold-200 bg-gold-50/60 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-700">
            <Wallet className="h-4 w-4" /> Revenus (paiements réussis)
          </h2>
          <p className="mt-3 text-3xl font-bold text-primary-900">
            {totalRevenue.toLocaleString("fr-FR")} <span className="text-base font-normal">FCFA</span>
          </p>
          <p className="mt-1 text-xs text-primary-900/50">
            Taux de conversion Premium : {premiumConversionRate}% des profils approuvés
          </p>
          {revenueByPlanData.length > 0 && (
            <div className="mt-4">
              <DistributionBars data={revenueByPlanData} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            <Globe2 className="h-4 w-4" /> Répartition par pays
          </h2>
          <div className="mt-4">
            {countryData.length === 0 ? (
              <p className="text-sm text-primary-900/50">Pas encore de données.</p>
            ) : (
              <DistributionBars data={countryData} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            Répartition par genre
          </h2>
          <div className="mt-4">
            {genderData.length === 0 ? (
              <p className="text-sm text-primary-900/50">Pas encore de données.</p>
            ) : (
              <DistributionBars data={genderData} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            Répartition par madhhab
          </h2>
          <div className="mt-4">
            {madhhabData.length === 0 ? (
              <p className="text-sm text-primary-900/50">Pas encore de données.</p>
            ) : (
              <DistributionBars data={madhhabData} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
