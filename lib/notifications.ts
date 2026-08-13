import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationType } from "@/lib/supabase/types";

export async function createNotification(params: {
  profileId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    profile_id: params.profileId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    link: params.link ?? null,
  });
}
