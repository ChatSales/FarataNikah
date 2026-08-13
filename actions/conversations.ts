"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ConversationActionState = { error: string } | { success: true } | null;

async function setArchived(
  conversationId: string,
  archived: boolean
): Promise<ConversationActionState> {
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
    .select("id, profile_a_id, profile_b_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.profile_a_id !== profile.id && conversation.profile_b_id !== profile.id)
  ) {
    return { error: "Conversation introuvable." };
  }

  const update =
    conversation.profile_a_id === profile.id
      ? { archived_by_a: archived }
      : { archived_by_b: archived };
  const { error } = await supabase.from("conversations").update(update).eq("id", conversationId);
  if (error) return { error: "Impossible de mettre à jour cette conversation." };

  revalidatePath("/app/messages");
  return { success: true };
}

export async function archiveConversationAction(
  _prevState: ConversationActionState,
  formData: FormData
): Promise<ConversationActionState> {
  return setArchived(String(formData.get("conversationId") ?? ""), true);
}

export async function unarchiveConversationAction(
  _prevState: ConversationActionState,
  formData: FormData
): Promise<ConversationActionState> {
  return setArchived(String(formData.get("conversationId") ?? ""), false);
}
