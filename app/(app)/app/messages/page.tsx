import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, verification_status")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  if (profile.verification_status !== "approved") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Clock3 className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-primary-900">
          Messagerie verrouillée
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
          Tu pourras échanger des messages avec les autres membres une fois
          ton profil validé par notre équipe.
        </p>
      </div>
    );
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, profile_a_id, profile_b_id, last_message_at, created_at")
    .or(`profile_a_id.eq.${profile.id},profile_b_id.eq.${profile.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const otherIds = Array.from(
    new Set(
      (conversations ?? []).map((c) =>
        c.profile_a_id === profile.id ? c.profile_b_id : c.profile_a_id
      )
    )
  );

  const { data: otherProfiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, is_anonymous")
        .in("id", otherIds)
    : { data: [] };

  const profileById = new Map((otherProfiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <p className="mt-8 text-sm text-primary-900/60">
          Aucune conversation pour l&apos;instant. Accepte une demande de
          contact pour commencer à échanger.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {conversations.map((c) => {
            const otherId =
              c.profile_a_id === profile.id ? c.profile_b_id : c.profile_a_id;
            const other = profileById.get(otherId);
            return (
              <li key={c.id}>
                <Link
                  href={`/app/messages/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-300"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-primary-900">
                      {other?.is_anonymous ? "Profil anonyme" : other?.first_name}
                    </p>
                    <p className="text-xs text-primary-900/50">
                      {c.last_message_at
                        ? new Date(c.last_message_at).toLocaleString("fr-FR")
                        : "Aucun message"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
