"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DeleteAccountState = { error: string } | null;

// Deleting the auth.users row cascades (via "on delete cascade" foreign keys)
// through profiles, profile_photos, contact_requests, conversations,
// messages, favorites, profile_visits, coach_conversations/messages,
// subscriptions and payment_transactions. Storage objects aren't relational
// rows, so they're removed explicitly first.
export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "SUPPRIMER") {
    return { error: "Merci de saisir SUPPRIMER pour confirmer." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: photos } = await admin.storage.from("profile-photos").list(user.id);
  if (photos && photos.length > 0) {
    await admin.storage
      .from("profile-photos")
      .remove(photos.map((photo) => `${user.id}/${photo.name}`));
  }

  // Voice clips live one folder deeper (${userId}/${conversationId}/file.webm)
  // — list() only returns one level, so each conversation subfolder needs
  // its own listing before the files inside it can be removed.
  const { data: voiceEntries } = await admin.storage.from("voice-messages").list(user.id);
  const voicePaths = (
    await Promise.all(
      (voiceEntries ?? []).map(async (entry) => {
        if (entry.id !== null) return [`${user.id}/${entry.name}`];
        const { data: files } = await admin.storage
          .from("voice-messages")
          .list(`${user.id}/${entry.name}`);
        return (files ?? []).map((f) => `${user.id}/${entry.name}/${f.name}`);
      })
    )
  ).flat();
  if (voicePaths.length > 0) {
    await admin.storage.from("voice-messages").remove(voicePaths);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return { error: "Impossible de supprimer le compte. Réessaie dans un instant." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
