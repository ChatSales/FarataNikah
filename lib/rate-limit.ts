import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// True if the call is allowed, false if the bucket is over its limit.
// Buckets are unauthenticated-endpoint-scoped (signup/login/password reset
// by IP) — the existing increment_and_check_counter() function handles the
// authenticated, per-profile daily limits (contact requests, Coach Amina)
// and isn't usable here since there's no profile yet at signup/login time.
export async function checkRateLimit(
  bucketKey: string,
  maxHits: number,
  windowMinutes: number
): Promise<boolean> {
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count } = await admin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("bucket_key", bucketKey)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= maxHits) return false;

  await admin.from("rate_limit_hits").insert({ bucket_key: bucketKey });

  // Opportunistic cleanup (no cron needed) — fires on ~1% of checks, cheap
  // enough to skip the rest of the time, keeps the table from growing
  // unbounded.
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await admin.from("rate_limit_hits").delete().lt("created_at", cutoff);
  }

  return true;
}
