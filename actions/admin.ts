"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { PREMIUM_PERIOD_DAYS } from "@/lib/premium";

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
  if (!adminRow) redirect("/app/home");

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
          link: "/app/home",
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

// Lets an admin flip their OWN account between the free and Premium
// experience for testing — never touches anyone else's plan, and only
// works for accounts already in admin_users (checked server-side by
// requireAdmin, not just hidden in the UI).
export type ToggleOwnPremiumState = { error: string } | { success: true } | null;

export async function toggleOwnPremiumAction(
  _prevState: ToggleOwnPremiumState
): Promise<ToggleOwnPremiumState> {
  const supabase = await createClient();
  const { user } = await requireAdmin(supabase);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return { error: "Ton profil n'est pas encore créé." };

  const nextIsPremium = !profile.is_premium;
  const premiumUntil = nextIsPremium
    ? new Date(Date.now() + PREMIUM_PERIOD_DAYS * 24 * 3600 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("profiles")
    .update({ is_premium: nextIsPremium, premium_until: premiumUntil })
    .eq("id", profile.id);
  if (error) return { error: "Impossible de changer de plan." };

  revalidatePath("/app/settings");
  revalidatePath("/app/discover");
  return { success: true };
}

export type TeamActionState = { error: string } | { success: true } | null;

export async function addAdminByEmailAction(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Merci de renseigner un email." };

  const supabase = await createClient();
  await requireAdmin(supabase);

  // admin_users has no client-writable RLS policy by design (provisioning
  // was meant to stay out of reach of a compromised member session) — the
  // requireAdmin() check above is what stands in for that policy now that
  // there's a UI for it, same pattern as the account-deletion storage
  // cleanup already uses the service-role client for cross-user writes.
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, user_id, first_name")
    .ilike("email", email)
    .maybeSingle();
  if (!profile) {
    return { error: "Aucun compte trouvé avec cet email. La personne doit d'abord s'inscrire." };
  }

  const { data: existing } = await admin
    .from("admin_users")
    .select("id")
    .eq("user_id", profile.user_id)
    .maybeSingle();
  if (existing) return { error: `${profile.first_name} est déjà administrateur/trice.` };

  const { error } = await admin
    .from("admin_users")
    .insert({ user_id: profile.user_id, role: "admin" });
  if (error) return { error: "Impossible d'ajouter cet administrateur." };

  revalidatePath("/admin/team");
  return { success: true };
}

export async function removeAdminAction(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const adminUserId = String(formData.get("adminUserId") ?? "");
  if (!adminUserId) return { error: "Administrateur introuvable." };

  const supabase = await createClient();
  const { user } = await requireAdmin(supabase);

  if (adminUserId === user.id) {
    return { error: "Tu ne peux pas te retirer toi-même. Demande à un autre admin." };
  }

  const admin = createAdminClient();
  const { count } = await admin
    .from("admin_users")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    return { error: "Impossible de retirer le dernier administrateur." };
  }

  const { error } = await admin.from("admin_users").delete().eq("user_id", adminUserId);
  if (error) return { error: "Impossible de retirer cet administrateur." };

  revalidatePath("/admin/team");
  return { success: true };
}

export type SettingsActionState = { error: string } | { success: true } | null;

export async function saveMetaSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const rawPixelId = String(formData.get("metaPixelId") ?? "").trim();
  if (rawPixelId && !/^\d{10,20}$/.test(rawPixelId)) {
    return { error: "L'identifiant du pixel Meta doit être une suite de chiffres." };
  }

  const rawToken = String(formData.get("metaAccessToken") ?? "").trim();
  const clearToken = formData.get("clearMetaAccessToken") === "on";

  const supabase = await createClient();
  await requireAdmin(supabase);

  const update: { meta_pixel_id: string | null; meta_access_token?: string | null } = {
    meta_pixel_id: rawPixelId || null,
  };
  // Blank input leaves an already-saved token untouched (it's never sent
  // back to the browser to prefill, so "blank" can't mean "the real value
  // is empty") — only an explicit checkbox clears it, or a non-blank value
  // replaces it.
  if (clearToken) {
    update.meta_access_token = null;
  } else if (rawToken) {
    update.meta_access_token = rawToken;
  }

  const { error } = await supabase.from("app_settings").update(update).eq("id", true);
  if (error) return { error: "Impossible d'enregistrer les réglages Meta." };

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}
