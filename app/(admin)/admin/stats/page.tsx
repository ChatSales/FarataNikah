import { createClient } from "@/lib/supabase/server";
import { Users, Clock3, Sparkles, MessageCircle, ShieldAlert, UserPlus } from "lucide-react";

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { count: approvedProfiles },
    { count: pendingVerifications },
    { count: rejectedProfiles },
    { count: premiumMembers },
    { count: newSignupsThisWeek },
    { count: totalMessages },
    { count: pendingFlags },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "approved"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "rejected"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase
      .from("moderation_flags")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
  ]);

  const cards = [
    { label: "Profils approuvés", value: approvedProfiles ?? 0, icon: Users },
    { label: "Vérifications en attente", value: pendingVerifications ?? 0, icon: Clock3 },
    { label: "Profils rejetés", value: rejectedProfiles ?? 0, icon: Users },
    { label: "Membres Premium", value: premiumMembers ?? 0, icon: Sparkles },
    { label: "Nouvelles inscriptions (7j)", value: newSignupsThisWeek ?? 0, icon: UserPlus },
    { label: "Messages envoyés (total)", value: totalMessages ?? 0, icon: MessageCircle },
    { label: "Signalements en attente", value: pendingFlags ?? 0, icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
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
    </div>
  );
}
