import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";

async function expireSubscriptions(supabase: ReturnType<typeof createAdminClient>) {
  const now = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("current_period_end", now)
    .select("id, profile_id");

  if (error) {
    console.error("Failed to expire subscriptions:", error);
    return 0;
  }

  for (const sub of expired ?? []) {
    await supabase.from("profiles").update({ is_premium: false }).eq("id", sub.profile_id);
  }

  return expired?.length ?? 0;
}

// Fires once, the day a profile crosses 14 days of inactivity (a tight
// 1-day window means it can only ever match once per inactive streak —
// last_active_at only moves again once they actually come back).
async function sendWinbackReminders(supabase: ReturnType<typeof createAdminClient>) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const { data: candidates, error } = await supabase
    .from("profiles")
    .select("id, email, first_name")
    .eq("verification_status", "approved")
    .gte("last_active_at", windowStart.toISOString())
    .lte("last_active_at", windowEnd.toISOString());

  if (error) {
    console.error("Failed to query win-back candidates:", error);
    return 0;
  }

  for (const profile of candidates ?? []) {
    await createNotification({
      profileId: profile.id,
      type: "winback_reminder",
      title: "Tu nous manques !",
      body: "De nouveaux profils compatibles t'attendent sur FarataNikah.",
      link: "/app/discover",
    });
    await sendEmail({
      to: profile.email,
      toName: profile.first_name,
      subject: "Tu nous manques sur FarataNikah",
      htmlContent: `<p>As-salamu alaykum ${profile.first_name},</p><p>Ça fait deux semaines qu'on ne t'a pas vu(e) — de nouveaux profils compatibles t'attendent. Reviens jeter un œil :</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/discover">Découvrir des profils</a></p>`,
    });
  }

  return candidates?.length ?? 0;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const expiredCount = await expireSubscriptions(supabase);
  const winbackCount = await sendWinbackReminders(supabase);

  return NextResponse.json({ expiredCount, winbackCount });
}
