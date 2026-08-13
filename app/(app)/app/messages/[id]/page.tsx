import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageForm } from "@/components/messages/message-form";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium, verification_status")
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

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, profile_a_id, profile_b_id, status")
    .eq("id", id)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.profile_a_id !== profile.id &&
      conversation.profile_b_id !== profile.id)
  ) {
    notFound();
  }

  const otherId =
    conversation.profile_a_id === profile.id
      ? conversation.profile_b_id
      : conversation.profile_a_id;

  const { data: other } = await supabase
    .from("profiles")
    .select("first_name, is_anonymous")
    .eq("id", otherId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select(
      "id, sender_profile_id, content, message_type, voice_storage_path, voice_duration_seconds, created_at"
    )
    .eq("conversation_id", id)
    .neq("moderation_status", "blocked")
    .order("created_at", { ascending: true });

  // Mark the other participant's messages as read now that this page has
  // been viewed — drives the unread badge on the conversation list and nav.
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", id)
    .neq("sender_profile_id", profile.id)
    .eq("is_read", false);

  // Voice clips live under the sender's own storage folder (owner-only RLS,
  // see 0009_voice_messages.sql), so the recipient's signed URL has to be
  // minted with the service-role client after the participant check above.
  const admin = createAdminClient();
  const messagesWithVoiceUrls = await Promise.all(
    (messages ?? []).map(async (m) => {
      if (m.message_type !== "voice" || !m.voice_storage_path) {
        return { ...m, voiceUrl: null as string | null };
      }
      const { data: signed } = await admin.storage
        .from("voice-messages")
        .createSignedUrl(m.voice_storage_path, 60 * 30);
      return { ...m, voiceUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 border-b border-primary-100 py-4">
        <Link href="/app/messages" className="text-primary-600 hover:text-primary-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-primary-900">
          {other?.is_anonymous ? "Profil anonyme" : other?.first_name}
        </h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {!messages || messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-primary-900/50">
            Dis salam pour démarrer la conversation.
          </p>
        ) : (
          messagesWithVoiceUrls.map((m) => {
            const isMine = m.sender_profile_id === profile.id;
            return (
              <div
                key={m.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "bg-primary-600 text-cream-50"
                      : "bg-primary-100 text-primary-900"
                  }`}
                >
                  {m.message_type === "voice" ? (
                    m.voiceUrl ? (
                      <audio
                        controls
                        src={m.voiceUrl}
                        className="h-8 max-w-[220px]"
                      />
                    ) : (
                      <p className="italic opacity-70">Message vocal indisponible</p>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  <p
                    className={`mt-1 text-[10px] ${
                      isMine ? "text-primary-100" : "text-primary-900/50"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageForm conversationId={conversation.id} isPremium={profile.is_premium} />
    </div>
  );
}
