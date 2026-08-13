"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
