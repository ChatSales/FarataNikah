"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/lib/supabase/types";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type NotificationsResult = { notifications: NotificationItem[] } | { error: string };

// Plain fetch, no side effect — the dedicated /app/notifications page reads
// via this, and viewing the list no longer auto-marks everything read
// (that used to happen on dropdown open; now it's an explicit action per
// item or via "tout marquer lu").
export async function getNotificationsAction(): Promise<NotificationsResult> {
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

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { error: "Impossible de charger les notifications." };

  return { notifications: notifications ?? [] };
}

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  revalidatePath("/app/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
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

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", profile.id)
    .eq("is_read", false);
  revalidatePath("/app/notifications");
}
