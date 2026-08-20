import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

// Runs daily. Follows up once, a few days after a member dismissed the
// Boost promo modal ("Plus tard") without buying — skips anyone who
// already has an active boost, and resets the dismissal timestamp so the
// same decline never triggers a second reminder.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
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
    return new NextResponse("Internal error", { status: 500 });
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
        link: "/app/settings",
      });
      sent++;
    }
    await supabase
      .from("profiles")
      .update({ boost_promo_dismissed_at: null })
      .eq("id", profile.id);
  }

  return NextResponse.json({ candidates: candidates?.length ?? 0, sent });
}
