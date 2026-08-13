import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModerationFlagActions } from "@/components/admin/moderation-flag-actions";

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
                className="rounded-xl border border-red-100 bg-red-50/40 p-5"
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
    </div>
  );
}
