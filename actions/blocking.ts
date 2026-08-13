"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileReportReason } from "@/lib/supabase/types";

export type BlockActionState = { error: string } | { success: true } | null;

async function getOwnProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
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

  return profile;
}

export async function blockProfileAction(
  _prevState: BlockActionState,
  formData: FormData
): Promise<BlockActionState> {
  const targetProfileId = String(formData.get("profileId") ?? "");
  if (!targetProfileId) return { error: "Profil introuvable." };

  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (profile.id === targetProfileId) {
    return { error: "Tu ne peux pas te bloquer toi-même." };
  }

  const { error } = await supabase
    .from("blocked_profiles")
    .upsert(
      { blocker_profile_id: profile.id, blocked_profile_id: targetProfileId },
      { onConflict: "blocker_profile_id,blocked_profile_id" }
    );
  if (error) return { error: "Impossible de bloquer ce profil." };

  // A blocked conversation still exists in the DB (for the moderation trail)
  // but sendMessageAction already refuses to post to a non-"active" one, so
  // flipping the status here is enough to cut off further messaging.
  await supabase
    .from("conversations")
    .update({ status: "blocked" })
    .or(
      `and(profile_a_id.eq.${profile.id},profile_b_id.eq.${targetProfileId}),and(profile_a_id.eq.${targetProfileId},profile_b_id.eq.${profile.id})`
    );

  revalidatePath("/app/discover");
  revalidatePath(`/app/profile/${targetProfileId}`);
  revalidatePath("/app/messages");
  return { success: true };
}

export async function unblockProfileAction(
  _prevState: BlockActionState,
  formData: FormData
): Promise<BlockActionState> {
  const targetProfileId = String(formData.get("profileId") ?? "");
  if (!targetProfileId) return { error: "Profil introuvable." };

  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  const { error } = await supabase
    .from("blocked_profiles")
    .delete()
    .eq("blocker_profile_id", profile.id)
    .eq("blocked_profile_id", targetProfileId);
  if (error) return { error: "Impossible de débloquer ce profil." };

  revalidatePath("/app/discover");
  revalidatePath(`/app/profile/${targetProfileId}`);
  return { success: true };
}

export async function reportProfileAction(
  _prevState: BlockActionState,
  formData: FormData
): Promise<BlockActionState> {
  const targetProfileId = String(formData.get("profileId") ?? "");
  const reason = String(formData.get("reason") ?? "") as ProfileReportReason;
  const details = String(formData.get("details") ?? "").trim() || null;

  const validReasons: ProfileReportReason[] = [
    "fake_profile",
    "inappropriate_content",
    "harassment",
    "already_married_hidden",
    "scam",
    "other",
  ];
  if (!targetProfileId || !validReasons.includes(reason)) {
    return { error: "Merci de préciser un motif de signalement." };
  }

  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (profile.id === targetProfileId) {
    return { error: "Tu ne peux pas te signaler toi-même." };
  }

  const { error } = await supabase.from("profile_reports").insert({
    reporter_profile_id: profile.id,
    reported_profile_id: targetProfileId,
    reason,
    details,
  });
  if (error) return { error: "Impossible d'envoyer le signalement." };

  return { success: true };
}
