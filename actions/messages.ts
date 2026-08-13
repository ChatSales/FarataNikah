"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { moderateMessage } from "@/lib/claude/moderation";

export type SendMessageState = { error: string } | { success: true } | null;

export async function sendMessageAction(
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Le message ne peut pas être vide." };
  if (content.length > 2000) return { error: "Message trop long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, profile_a_id, profile_b_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.profile_a_id !== profile.id &&
      conversation.profile_b_id !== profile.id)
  ) {
    return { error: "Conversation introuvable." };
  }
  if (conversation.status !== "active") {
    return { error: "Cette conversation n'est plus active." };
  }

  const moderation = await moderateMessage(content);
  const severity = moderation.flagged ? moderation.severity : null;

  // Blocked messages are still persisted (moderation_status: "blocked") and
  // logged to moderation_flags for admin audit — they're just never shown
  // to either participant. Without this, a bad actor's blocked attempts
  // leave no trace for moderators to act on.
  const moderationStatus =
    severity === "high" ? "blocked" : severity === "medium" ? "flagged" : "approved";

  const { data: inserted, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_profile_id: profile.id,
      content,
      moderation_status: moderationStatus,
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    return { error: "Impossible d'envoyer le message." };
  }

  if (moderation.flagged) {
    await supabase.from("moderation_flags").insert({
      message_id: inserted.id,
      profile_id: profile.id,
      flag_type: moderation.category ?? "other",
      severity: moderation.severity ?? "low",
      ai_reasoning: moderation.reasoning,
    });
  }

  if (moderationStatus === "blocked") {
    return {
      error:
        "Ce message n'a pas pu être envoyé car il enfreint les règles de la plateforme.",
    };
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/app/messages/${conversationId}`);
  return { success: true };
}

const MAX_VOICE_MESSAGE_BYTES = 8 * 1024 * 1024; // ~8 min of opus/webm at typical bitrates
const MAX_VOICE_MESSAGE_SECONDS = 180;

export async function sendVoiceMessageAction(
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const audio = formData.get("audio");
  const durationSeconds = Number(formData.get("durationSeconds") ?? 0);

  if (!(audio instanceof File) || audio.size === 0) {
    return { error: "Aucun enregistrement à envoyer." };
  }
  if (audio.size > MAX_VOICE_MESSAGE_BYTES) {
    return { error: "Message vocal trop volumineux." };
  }
  if (!durationSeconds || durationSeconds > MAX_VOICE_MESSAGE_SECONDS) {
    return { error: "Message vocal trop long (3 minutes maximum)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");
  if (!profile.is_premium) {
    return { error: "Les messages vocaux sont réservés aux membres Premium." };
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, profile_a_id, profile_b_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.profile_a_id !== profile.id &&
      conversation.profile_b_id !== profile.id)
  ) {
    return { error: "Conversation introuvable." };
  }
  if (conversation.status !== "active") {
    return { error: "Cette conversation n'est plus active." };
  }

  const storagePath = `${user.id}/${conversationId}/${crypto.randomUUID()}.webm`;
  const { error: uploadError } = await supabase.storage
    .from("voice-messages")
    .upload(storagePath, audio, { contentType: audio.type || "audio/webm" });
  if (uploadError) {
    return { error: "Impossible d'envoyer le message vocal." };
  }

  // Voice messages skip the Claude text-moderation pipeline (no
  // transcription step in the MVP) — they're covered by the same
  // member-reporting path as any other message instead.
  const { error: insertError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_profile_id: profile.id,
    message_type: "voice",
    voice_storage_path: storagePath,
    voice_duration_seconds: Math.round(durationSeconds),
    moderation_status: "approved",
  });
  if (insertError) {
    return { error: "Impossible d'envoyer le message vocal." };
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/app/messages/${conversationId}`);
  return { success: true };
}
