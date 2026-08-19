import { AlertTriangle, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModerationFlagActions } from "@/components/admin/moderation-flag-actions";
import { ProfileReportActions } from "@/components/admin/profile-report-actions";

const flagTypeLabels: Record<string, string> = {
  inappropriate_content: "Contenu inapproprié",
  contact_info_exchange: "Échange de coordonnées",
  harassment: "Harcèlement",
  spam: "Spam",
  other: "Autre",
};

const severityLabels: Record<string, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};

const reportReasonLabels: Record<string, string> = {
  fake_profile: "Faux profil / usurpation",
  inappropriate_content: "Contenu inapproprié",
  harassment: "Harcèlement",
  already_married_hidden: "Situation matrimoniale cachée",
  scam: "Arnaque / démarchage",
  other: "Autre",
};

export default async function AdminModerationQueuePage() {
  const supabase = await createClient();

  const { data: flags } = await supabase
    .from("moderation_flags")
    .select("id, message_id, profile_id, flag_type, severity, ai_reasoning, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const messageIds = Array.from(new Set((flags ?? []).map((f) => f.message_id)));
  const profileIds = Array.from(new Set((flags ?? []).map((f) => f.profile_id)));

  const { data: messages } = messageIds.length
    ? await supabase.from("messages").select("id, content").in("id", messageIds)
    : { data: [] };
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, first_name").in("id", profileIds)
    : { data: [] };

  const messageById = new Map((messages ?? []).map((m) => [m.id, m]));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const { data: reports } = await supabase
    .from("profile_reports")
    .select("id, reporter_profile_id, reported_profile_id, reason, details, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const reportProfileIds = Array.from(
    new Set((reports ?? []).flatMap((r) => [r.reporter_profile_id, r.reported_profile_id]))
  );
  const { data: reportProfiles } = reportProfileIds.length
    ? await supabase.from("profiles").select("id, first_name").in("id", reportProfileIds)
    : { data: [] };
  const reportProfileById = new Map((reportProfiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">
        File de modération ({flags?.length ?? 0})
      </h1>

      {!flags || flags.length === 0 ? (
        <p className="mt-8 text-sm text-primary-900/60">
          Aucun message signalé en attente.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {flags.map((f) => {
            const message = messageById.get(f.message_id);
            const sender = profileById.get(f.profile_id);
            return (
              <li
                key={f.id}
                className="rounded-xl border border-red-100 bg-red-50/40 p-5 transition hover:border-red-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      {sender?.first_name} · {flagTypeLabels[f.flag_type]} · Sévérité{" "}
                      {severityLabels[f.severity]}
                    </p>
                    <p className="mt-2 rounded-lg bg-cream-50 p-3 text-sm text-primary-900/80">
                      &ldquo;{message?.content}&rdquo;
                    </p>
                    {f.ai_reasoning && (
                      <p className="mt-2 text-xs text-primary-900/50">
                        Raisonnement IA : {f.ai_reasoning}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <ModerationFlagActions flagId={f.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-12 text-xl font-semibold text-primary-900">
        Signalements de profils ({reports?.length ?? 0})
      </h2>

      {!reports || reports.length === 0 ? (
        <p className="mt-4 text-sm text-primary-900/60">
          Aucun profil signalé en attente.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reports.map((r) => {
            const reporter = reportProfileById.get(r.reporter_profile_id);
            const reported = reportProfileById.get(r.reported_profile_id);
            return (
              <li key={r.id} className="rounded-xl border border-red-100 bg-red-50/40 p-5 transition hover:border-red-200 hover:shadow-sm">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                  <Flag className="h-4 w-4 text-red-500" />
                  {reported?.first_name ?? "Profil"} signalé par {reporter?.first_name ?? "un membre"}{" "}
                  · {reportReasonLabels[r.reason]}
                </p>
                {r.details && (
                  <p className="mt-2 rounded-lg bg-cream-50 p-3 text-sm text-primary-900/80">
                    &ldquo;{r.details}&rdquo;
                  </p>
                )}
                <div className="mt-4">
                  <ProfileReportActions reportId={r.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
