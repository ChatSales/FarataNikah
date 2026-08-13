import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Clock3, Mic, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ArchiveButton } from "@/components/messages/archive-button";

type Tab = "all" | "unread" | "read" | "archived";

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "unread", label: "Non lus" },
  { value: "read", label: "Lus" },
  { value: "archived", label: "Archivées" },
];

export default async function MessagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = tabs.some((t) => t.value === rawTab) ? (rawTab as Tab) : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, verification_status, is_premium")
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
    .select(
      "id, profile_a_id, profile_b_id, last_message_at, created_at, archived_by_a, archived_by_b"
    )
    .or(`profile_a_id.eq.${profile.id},profile_b_id.eq.${profile.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversationIds = (conversations ?? []).map((c) => c.id);
  const { data: unreadMessages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .neq("sender_profile_id", profile.id)
        .eq("is_read", false)
    : { data: [] };
  const unreadConversationIds = new Set((unreadMessages ?? []).map((m) => m.conversation_id));

  const { data: anyMessages } = conversationIds.length
    ? await supabase.from("messages").select("conversation_id").in("conversation_id", conversationIds)
    : { data: [] };
  const conversationsWithMessages = new Set((anyMessages ?? []).map((m) => m.conversation_id));

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

  const withMeta = (conversations ?? []).map((c) => {
    const isArchived = c.profile_a_id === profile.id ? c.archived_by_a : c.archived_by_b;
    return {
      ...c,
      isArchived,
      isUnread: unreadConversationIds.has(c.id),
      hasMessages: conversationsWithMessages.has(c.id),
    };
  });

  const activeConversations = withMeta.filter((c) => !c.isArchived);
  const filtered = withMeta.filter((c) => {
    if (tab === "archived") return c.isArchived;
    if (c.isArchived) return false;
    if (tab === "unread") return c.isUnread;
    if (tab === "read") return c.hasMessages && !c.isUnread;
    return true;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
        Messages <MessageCircle className="h-5 w-5 text-primary-400" />
      </h1>
      <p className="mt-1 text-sm text-primary-900/55">
        {activeConversations.length} conversation{activeConversations.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-primary-50 p-1">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/app/messages" : `/app/messages?tab=${t.value}`}
            className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-center text-sm font-medium transition ${
              tab === t.value
                ? "bg-primary-600 text-cream-50 shadow-sm"
                : "text-primary-900/60 hover:text-primary-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab !== "archived" && (
        <Link
          href={profile.is_premium ? "/app/messages" : "/app/settings"}
          className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-4 text-cream-50 shadow-md transition hover:from-gold-600 hover:to-gold-500"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-50/20">
            <Mic className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2 text-sm font-semibold">
              Messages vocaux
              <span className="rounded-full bg-cream-50/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                Nouveau
              </span>
            </span>
            <span className="block text-xs text-cream-50/90">
              Fais entendre ta voix ! Exclusif Premium
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      )}

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-500">
            <MessageCircle className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-primary-900">
            {tab === "archived" ? "Aucune conversation archivée" : "Aucune conversation"}
          </h2>
          <p className="mt-1 text-sm text-primary-900/60">
            {tab === "archived"
              ? "Les conversations que tu archives apparaîtront ici."
              : "Envoie une demande de contact pour commencer à échanger."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {filtered.map((c) => {
            const otherId = c.profile_a_id === profile.id ? c.profile_b_id : c.profile_a_id;
            const other = profileById.get(otherId);
            return (
              <li key={c.id}>
                <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-cream-50 p-2 pr-3 transition hover:border-primary-300">
                  <Link
                    href={`/app/messages/${c.id}`}
                    className="flex flex-1 items-center gap-3 p-2"
                  >
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <MessageCircle className="h-5 w-5" />
                      {c.isUnread && (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-cream-50 bg-red-500" />
                      )}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${c.isUnread ? "font-semibold text-primary-900" : "font-medium text-primary-900"}`}
                      >
                        {other?.is_anonymous ? "Profil anonyme" : other?.first_name}
                      </p>
                      <p className="text-xs text-primary-900/50">
                        {c.last_message_at
                          ? new Date(c.last_message_at).toLocaleString("fr-FR")
                          : "Aucun message"}
                      </p>
                    </div>
                  </Link>
                  <ArchiveButton conversationId={c.id} archived={c.isArchived} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
