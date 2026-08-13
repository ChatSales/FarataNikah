import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Service-role client. Bypasses Row Level Security entirely — never import
// this from client components, and never expose SUPABASE_SERVICE_ROLE_KEY
// with a NEXT_PUBLIC_ prefix. Reserved for: payment webhooks, the expiry
// cron, and admin mutations that must operate across all profiles.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
