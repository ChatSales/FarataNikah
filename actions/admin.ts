"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export type AdminActionState = { error: string } | null;

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) redirect("/app/discover");

  return { user, adminId: adminRow.id };
}

async function setVerificationStatus(
  profileId: string,
  status: "approved" | "rejected",
  reason: string | null
): Promise<AdminActionState> {
  const supabase = await createClient();
  const { adminId } = await requireAdmin(supabase);

  const { data: current } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", profileId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: status,
      verification_reviewed_by: adminId,
      verification_rejection_reason: status === "rejected" ? reason : null,
    })
    .eq("id", profileId);
  if (error) {
    return {
      error:
        status === "approved"
          ? "Impossible d'approuver ce profil."
          : "Impossible de rejeter ce profil.",
    };
  }

  await supabase.from("verification_history").insert({
    profile_id: profileId,
    previous_status: current?.verification_status ?? null,
    new_status: status,
    reason,
    changed_by: adminId,
  });

  await createNotification(
    status === "approved"
      ? {
          profileId,
          type: "profile_approved",
          title: "Profil validé !",
          body: "Ton profil est maintenant visible par les autres membres.",
          link: "/app/discover",
        }
      : {
          profileId,
          type: "profile_rejected",
          title: "Profil non validé",
          body: reason ?? "Notre équipe n'a pas pu valider ton profil en l'état.",
          link: "/onboarding/pending",
        }
  );

  revalidatePath("/admin/verification");
  redirect("/admin/verification");
}

export async function approveProfileAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const profileId = String(formData.get("profileId") ?? "");
  return setVerificationStatus(profileId, "approved", null);
}

export async function rejectProfileAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const profileId = String(formData.get("profileId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "Merci d'indiquer un motif de rejet." };
  return setVerificationStatus(profileId, "rejected", reason);
}

async function setModerationFlagStatus(
  flagId: string,
  status: "confirmed" | "dismissed"
) {
  const supabase = await createClient();
  const { adminId } = await requireAdmin(supabase);

  await supabase
    .from("moderation_flags")
    .update({ status, reviewed_by: adminId })
    .eq("id", flagId);

  revalidatePath("/admin/moderation");
}

export async function confirmModerationFlagAction(formData: FormData) {
  const flagId = String(formData.get("flagId") ?? "");
  await setModerationFlagStatus(flagId, "confirmed");
}

export async function dismissModerationFlagAction(formData: FormData) {
  const flagId = String(formData.get("flagId") ?? "");
  await setModerationFlagStatus(flagId, "dismissed");
}

async function setProfileReportStatus(
  reportId: string,
  status: "confirmed" | "dismissed"
) {
  const supabase = await createClient();
  const { adminId } = await requireAdmin(supabase);

  await supabase
    .from("profile_reports")
    .update({ status, reviewed_by: adminId })
    .eq("id", reportId);

  revalidatePath("/admin/moderation");
}

export async function confirmProfileReportAction(formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "");
  await setProfileReportStatus(reportId, "confirmed");
}

export async function dismissProfileReportAction(formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "");
  await setProfileReportStatus(reportId, "dismissed");
}
