"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_DAILY_CONTACT_REQUESTS } from "@/lib/usage-limits";

export type ContactRequestActionState = { error: string } | { success: true } | null;

async function getOwnApprovedProfile(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/basic-info");
  if (profile.verification_status !== "approved") redirect("/onboarding/pending");

  return profile;
}

export async function sendContactRequestAction(
  _prevState: ContactRequestActionState,
  formData: FormData
): Promise<ContactRequestActionState> {
  const recipientProfileId = String(formData.get("recipientProfileId") ?? "");
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!recipientProfileId) return { error: "Profil introuvable." };

  const supabase = await createClient();
  const profile = await getOwnApprovedProfile(supabase);

  if (profile.id === recipientProfileId) {
    return { error: "Tu ne peux pas t'envoyer une demande à toi-même." };
  }

  const { data: existing } = await supabase
    .from("contact_requests")
    .select("id, status")
    .or(
      `and(sender_profile_id.eq.${profile.id},recipient_profile_id.eq.${recipientProfileId}),and(sender_profile_id.eq.${recipientProfileId},recipient_profile_id.eq.${profile.id})`
    )
    .neq("status", "declined")
    .maybeSingle();

  if (existing) {
    return { error: "Une demande existe déjà avec ce profil." };
  }

  if (!profile.is_premium) {
    const { data: allowed, error: counterError } = await supabase.rpc(
      "increment_and_check_counter",
      {
        p_profile_id: profile.id,
        p_column: "contact_requests_sent",
        p_limit: FREE_DAILY_CONTACT_REQUESTS,
      }
    );
    if (counterError) return { error: "Une erreur est survenue." };
    if (!allowed) {
      return {
        error: `Limite quotidienne atteinte (${FREE_DAILY_CONTACT_REQUESTS} demandes/jour en gratuit). Passe Premium pour des demandes illimitées.`,
      };
    }
  }

  const { error } = await supabase.from("contact_requests").insert({
    sender_profile_id: profile.id,
    recipient_profile_id: recipientProfileId,
    message,
  });

  if (error) return { error: "Impossible d'envoyer la demande." };

  revalidatePath("/app/discover");
  revalidatePath("/app/requests");
  return { success: true };
}

export async function respondToContactRequestAction(
  _prevState: ContactRequestActionState,
  formData: FormData
): Promise<ContactRequestActionState> {
  const requestId = String(formData.get("requestId") ?? "");
  const accept = formData.get("accept") === "true";

  const supabase = await createClient();
  const profile = await getOwnApprovedProfile(supabase);

  const { data: request } = await supabase
    .from("contact_requests")
    .select("id, sender_profile_id, recipient_profile_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || request.recipient_profile_id !== profile.id) {
    return { error: "Demande introuvable." };
  }
  if (request.status !== "pending") {
    return { error: "Cette demande a déjà reçu une réponse." };
  }

  const { error: updateError } = await supabase
    .from("contact_requests")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (updateError) return { error: "Impossible de répondre à cette demande." };

  if (accept) {
    const { error: convError } = await supabase.from("conversations").insert({
      contact_request_id: request.id,
      profile_a_id: request.sender_profile_id,
      profile_b_id: request.recipient_profile_id,
    });
    if (convError) return { error: "Impossible de créer la conversation." };
  }

  revalidatePath("/app/requests");
  revalidatePath("/app/discover");
  return { success: true };
}
