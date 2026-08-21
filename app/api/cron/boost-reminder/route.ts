import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";

// Runs daily. Follows up once, a few days after a member dismissed the
// Boost promo modal ("Plus tard") without buying — skips anyone who
// already has an active boost, and resets the dismissal timestamp so the
// same decline never triggers a second reminder.
async function sendBoostReminders(supabase: ReturnType<typeof createAdminClient>) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const { data: candidates, error } = await supabase
    .from("profiles")
    .select("id, boosted_until")
    .gte("boost_promo_dismissed_at", windowStart.toISOString())
    .lte("boost_promo_dismissed_at", windowEnd.toISOString());

  if (error) {
    console.error("Failed to query boost-reminder candidates:", error);
    return 0;
  }

  let sent = 0;
  for (const profile of candidates ?? []) {
    const hasActiveBoost = profile.boosted_until && new Date(profile.boosted_until) > now;
    if (!hasActiveBoost) {
      await createNotification({
        profileId: profile.id,
        type: "boost_reminder",
        title: "Ton profil t'attend",
        body: "Booste ta visibilité pour être vu en priorité dans Découvrir.",
        link: "/app/premium",
      });
      sent++;
    }
    await supabase
      .from("profiles")
      .update({ boost_promo_dismissed_at: null })
      .eq("id", profile.id);
  }

  return sent;
}

// Shares this route (rather than its own Vercel cron entry) purely to
// stay within the Hobby-plan 2-cron-job cap — internally gated to Mondays
// only, so it still behaves as a weekly job despite the route running
// daily. Email only (no in-app notification): this is meant to read like
// a digest landing in an inbox, not add to the notification list.
async function sendWeeklyDigest(supabase: ReturnType<typeof createAdminClient>) {
  if (new Date().getUTCDay() !== 1) return 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, gender, country")
    .eq("verification_status", "approved");
  if (error) {
    console.error("Failed to query weekly-digest members:", error);
    return 0;
  }

  let sent = 0;
  for (const member of members ?? []) {
    const oppositeGender = member.gender === "male" ? "female" : "male";
    const { data: newProfiles } = await supabase
      .from("profiles")
      .select("first_name, city, country")
      .eq("verification_status", "approved")
      .eq("gender", oppositeGender)
      .gte("created_at", sevenDaysAgo)
      .limit(3);
    if (!newProfiles || newProfiles.length === 0) continue;

    const items = newProfiles
      .map((p) => `<li>${p.first_name} — ${p.city}, ${p.country}</li>`)
      .join("");
    await sendEmail({
      to: member.email,
      toName: member.first_name,
      subject: "De nouveaux profils compatibles cette semaine",
      htmlContent: `<p>As-salamu alaykum ${member.first_name},</p><p>Voici de nouveaux membres inscrits cette semaine :</p><ul>${items}</ul><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/discover">Voir sur FarataNikah</a></p>`,
    });
    sent++;
  }

  return sent;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const boostRemindersSent = await sendBoostReminders(supabase);
  const digestsSent = await sendWeeklyDigest(supabase);

  return NextResponse.json({ boostRemindersSent, digestsSent });
}
