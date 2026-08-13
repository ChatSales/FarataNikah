"use server";

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

// Fetches the member's most recent notifications and marks whatever was
// unread as read in the same call — the bell dropdown is the only UI that
// reads this list, so "opened the dropdown" and "seen" are the same event.
export async function fetchAndMarkNotificationsAction(): Promise<NotificationsResult> {
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
    .limit(20);
  if (error) return { error: "Impossible de charger les notifications." };

  const unreadIds = (notifications ?? []).filter((n) => !n.is_read).map((n) => n.id);
  if (unreadIds.length > 0) {
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
  }

  return { notifications: notifications ?? [] };
}
