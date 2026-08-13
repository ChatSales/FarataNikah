import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MetaPixelForm } from "@/components/admin/meta-pixel-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
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

  const { data: settings } = await supabase
    .from("app_settings")
    .select("meta_pixel_id")
    .eq("id", true)
    .maybeSingle();

  // Whether an access token is already stored is admin-relevant UI state,
  // but the value itself is never read back to the browser — the public
  // SELECT grant on app_settings deliberately excludes that column
  // (migration 0020), so this check goes through the service-role client.
  const adminClient = createAdminClient();
  const { data: tokenRow } = await adminClient
    .from("app_settings")
    .select("meta_access_token")
    .eq("id", true)
    .maybeSingle();
  const hasAccessToken = Boolean(tokenRow?.meta_access_token);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
        <Settings2 className="h-6 w-6 text-primary-700" /> Réglages
      </h1>

      <section className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Pixel Meta (Facebook Ads)
        </h2>
        <p className="mt-1 text-sm text-primary-900/60">
          Connecte ton pixel pour suivre les inscriptions et les abonnements Premium
          générés par tes campagnes Facebook/Instagram.
        </p>
        <div className="mt-4">
          <MetaPixelForm
            currentPixelId={settings?.meta_pixel_id ?? null}
            hasAccessToken={hasAccessToken}
          />
        </div>
      </section>
    </div>
  );
}
