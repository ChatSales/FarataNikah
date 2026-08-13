import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("current_period_end", now)
    .select("id, profile_id");

  if (error) {
    console.error("Failed to expire subscriptions:", error);
    return new NextResponse("Internal error", { status: 500 });
  }

  for (const sub of expired ?? []) {
    await supabase
      .from("profiles")
      .update({ is_premium: false })
      .eq("id", sub.profile_id);
  }

  return NextResponse.json({ expiredCount: expired?.length ?? 0 });
}
